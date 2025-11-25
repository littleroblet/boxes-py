# Copyright (C) 2013-2014 Florian Festi
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.

from boxes import *


class Castle(Boxes):
    """Castle tower with walls"""

    description = """Castle tower display with walls. Allowing for multiple towers and walls
to be connected together using finger joints. The layout of the castle can be customized
using a simple text-based format."""
    ui_group = "Display"
    ui_flag = "Experimental"
    tags = ["castle", "tower"]
    label = "Castle tower display"


    def __init__(self) -> None:
        Boxes.__init__(self)
        self.addSettingsArgs(edges.FingerJointSettings)

        self.argparser.add_argument(
            "--towerheight", action="store", type=float, default=250.0,
            help="hight of the tower in mm")
        
        self.argparser.add_argument(
            "--towerlength", action="store", type=float, default=70.0,
            help="length of the tower axis in mm")
        
        self.argparser.add_argument(
            "--wallheight", action="store", type=float, default=120.0,
            help="height of the wall in mm")
        
        self.argparser.add_argument(
            "--walllength", action="store", type=float, default=200.0,
            help="length of the wall in mm")
        
        self.argparser.add_argument(
            "--castleindent", action="store", type=float, default=10.0,
            help="castle indents height and width in mm")
        
        self.argparser.add_argument(
            "--layout", action="store", type=str, default="#-#\n| |\n#-#",
            help="""The layout of the castle parts using the following symbols:
            # for a tower
            - for a horizontal wall
            | for a vertical wall
            #-# as an example layout
""")

    def parse_layout(self, layout_string):
        # Split into rows, strip whitespace
        rows = [row.strip() for row in layout_string.strip().split('\n')]
        
        # Build a grid dictionary: {(row, col): char}
        grid = {}
        for row_idx, row in enumerate(rows):
            for col_idx, char in enumerate(row):
                if char in '#-|':  # Only care about these
                    grid[(row_idx, col_idx)] = char
        
        return grid, rows

    def analyze_layout(self, grid):
        towers = []
        h_walls = []  # horizontal walls (-)
        v_walls = []  # vertical walls (|)
        
        for (row, col), char in grid.items():
            if char == '#':
                towers.append((row, col))
            elif char == '-':
                h_walls.append((row, col))
            elif char == '|':
                v_walls.append((row, col))
        
        return towers, h_walls, v_walls

    def get_tower_connections(self, grid, tower_pos):
        row, col = tower_pos
        connections = {
            'north': grid.get((row - 1, col)) == '|',
            'south': grid.get((row + 1, col)) == '|',
            'west': grid.get((row, col - 1)) == '-',
            'east': grid.get((row, col + 1)) == '-'
        }
        return connections
    
    def get_wall_edges(self, grid, wall_pos, is_horizontal):
        row, col = wall_pos
        
        if is_horizontal:  # '-' wall
            left_connected = grid.get((row, col - 1)) in ['#', '-']
            right_connected = grid.get((row, col + 1)) in ['#', '-']
        else:  # '|' wall
            left_connected = grid.get((row - 1, col)) in ['#', '|']
            right_connected = grid.get((row + 1, col)) in ['#', '|']
        
        # Build edge string: bottom-right-top-left
        if left_connected and right_connected:
            return "efpf"  # double finger
        elif right_connected:
            return "efpe"  # single finger right
        elif left_connected:
            return "fepe"  # single finger left
        else:
            return "eepe"  # no fingers (standalone?)

    def draw_tower(self, connections):
        """Draw a tower with finger holes based on connections"""
        # Tower has 4 walls - we need to add fingerHoles on walls that connect to castle walls
        
        # Wall 1 (west side gets holes if connected to west)
        callback1 = [lambda: self.fingerHolesAt(self.towerlength * 0.5, 0, self.wallheight, 90)] if connections['west'] else None
        self.rectangularWall(self.towerlength, self.towerheight, edges="efPf", move="right", callback=callback1)
        
        # Wall 2 (north side gets holes if connected to north)
        callback2 = [lambda: self.fingerHolesAt(self.towerlength * 0.5, 0, self.wallheight, 90)] if connections['north'] else None
        self.rectangularWall(self.towerlength, self.towerheight, edges="efPf", move="right", callback=callback2)
        
        # Wall 3 (east side gets holes if connected to east)
        callback3 = [lambda: self.fingerHolesAt(self.towerlength * 0.5, 0, self.wallheight, 90)] if connections['east'] else None
        self.rectangularWall(self.towerlength, self.towerheight, edges="eFPF", move="right", callback=callback3)
        
        # Wall 4 (south side gets holes if connected to south)
        callback4 = [lambda: self.fingerHolesAt(self.towerlength * 0.5, 0, self.wallheight, 90)] if connections['south'] else None
        self.rectangularWall(self.towerlength, self.towerheight, edges="eFPF", move="right", callback=callback4)

    def draw_wall(self, wall_edges, is_horizontal):
        """Draw a wall with appropriate edge configuration"""
        self.rectangularWall(self.walllength, self.wallheight, wall_edges, move="right")

    def render(self):
        
        if(self.wallheight + 20.0 >= self.towerheight):
            self.wallheight = self.towerheight - 20.0

        if(self.castleindent >= self.towerlength * 0.5):
            self.castleindent = (self.towerlength * 0.5) - 1.0
        
        s = edges.FingerJointSettings(self.castleindent, relative=True,
                                      space=1, finger=1,
                                      width=self.thickness)

        s.edgeObjects(self, "pPQ")

        grid, rows = self.parse_layout(self.layout)
        towers, h_walls, v_walls = self.analyze_layout(grid)

        self.moveTo(0, 0)

        # Draw each tower
        for tower_pos in towers:
            connections = self.get_tower_connections(grid, tower_pos)
            self.draw_tower(connections)
        
        # Draw each horizontal wall
        for wall_pos in h_walls:
            wall_edges = self.get_wall_edges(grid, wall_pos, is_horizontal=True)
            self.draw_wall(wall_edges, is_horizontal=True)
        
        # Draw each vertical wall  
        for wall_pos in v_walls:
            wall_edges = self.get_wall_edges(grid, wall_pos, is_horizontal=False)
            self.draw_wall(wall_edges, is_horizontal=False)