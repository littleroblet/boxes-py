# Copyright (C) 2013-2019 Florian Festi
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
from boxes.walledges import _WallMountedBox

class WallXXX(_WallMountedBox): # Change class name!
    """DESCRIPTION"""

    ui_group = "Misc" # see ./__init__.py for names
    description = """EXPLAIN WHAT YOUR GENERATOR DOES"""
    created_date = "2025-11-27" # will allow sorted by newest
    release_notes = """Initial release""" # optional allows for changelog if you add new features. 
    ui_flag = "Experimental"  # Experimental, Deprecated, Beta, Updated
    tags = ["Tag1", "Tag2"]  # Tags for searching
    label = "A nice name"

    def __init__(self) -> None:
        super().__init__()

        # remove cli params you do not need
        self.buildArgParser(x=100, sx="3*50", y=100, sy="3*50", h=100, hi=0)

        # Add non default cli params if needed (see argparse std lib)
        self.argparser.add_argument(
            "--XX",  action="store", type=float, default=0.5,
            help="DESCRIPTION")

        # Add non default cli params if needed (see argparse std lib)
        self.argparser.add_argument(
            "--XXX",  action="store", type=boolarg, default=False,
            help="DESCRIPTION")

    def render(self):
        self.generateWallEdges() # creates the aAbBcCdD| edges

        # render your parts here
