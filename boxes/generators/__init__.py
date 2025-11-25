from __future__ import annotations

import importlib
import inspect
import os
import pkgutil
from types import ModuleType
from typing import Any

import boxes

ui_groups_by_name = {}


class UIGroup:

    def __init__(self, name: str, title: str | None = None, description: str = "", image: str = "") -> None:
        self.name = name
        self.title = title or name
        self.description = description
        self._image = image
        self.generators: list[Any] = []
        # register
        ui_groups_by_name[name] = self

    def add(self, box) -> None:
        self.generators.append(box)
        self.generators.sort(key=lambda b: getattr(b, '__name__', None) or b.__class__.__name__)

    @property
    def thumbnail(self) -> str:
        return self._image and f"{self._image}-thumb.jpg"

    @property
    def image(self) -> str:
        return self._image and f"{self._image}.jpg"


ui_groups: list[UIGroup] = [
    UIGroup("Basic", "Basic Boxes", image="ABox"),
    UIGroup("Organisation", "Organizational Boxes", image="CardBox"),
    UIGroup("Tray", "Trays and Drawer Inserts", image="TypeTray"),
    UIGroup("Special", "Special Boxes", image="SideDoorHousing"),
    UIGroup("Games", "Board Games Boxes", image="ChessBox"),
    UIGroup("Art", "Art and Photo Frames", image="Shadowbox"),
    UIGroup("FlexBox", "Flex & Living Hinges", image="RoundedBox"),
    UIGroup("Display", "Display Cases and Items for Display", image="Castle"),
    UIGroup("Electronics", "Electronics Enclosures", image="ElectroBox"),
    UIGroup("Robotics", "Robotic Parts and Robots", image="RobotArm"),
    UIGroup("Gridfinity", "Gridfinity Compatible Boxes", image="GridfinityBox"),
    UIGroup("Rack", "Rack Mounted Systems", image="Rack19Box"),
    UIGroup("WallSystem", "Wall System", image="WallConsole"),
    UIGroup("WallMounted", "Flat Wall Mounted Boxes", image="WallTypeTray"),
    UIGroup("Patterns", "Patterns & Templates", image="GridPattern"),
    UIGroup("Part", "Parts and Samples", image="BurnTest"),
    UIGroup("Testing", "Testing and Calibration Boxes", image="CalibrationBox"),
    UIGroup("Misc", "Miscellaneous Boxes", image="TrafficLight"),
]


def getAllBoxGenerators() -> dict[str, type[boxes.Boxes]]:
    generators = {}
    path = __path__
    if "BOXES_GENERATOR_PATH" in os.environ:
        path.extend(os.environ.get("BOXES_GENERATOR_PATH", "").split(":"))
    for importer, modname, ispkg in pkgutil.walk_packages(path=path, prefix=__name__ + '.'):
        module = importlib.import_module(modname)
        if module.__name__.split('.')[-1].startswith("_"):
            continue
        for k, v in module.__dict__.items():
            if v is boxes.Boxes:
                continue
            if inspect.isclass(v) and issubclass(v, boxes.Boxes) and v.__name__[0] != '_':
                generators[modname + '.' + v.__name__] = v
    return generators


def getAllGeneratorModules() -> dict[str, ModuleType]:
    generators = {}
    path = __path__
    if "BOXES_GENERATOR_PATH" in os.environ:
        path.extend(os.environ.get("BOXES_GENERATOR_PATH", "").split(":"))
    for importer, modname, ispkg in pkgutil.walk_packages(
            path=path,
            prefix=__name__ + '.',
            onerror=lambda x: None):
        module = importlib.import_module(modname)
        generators[modname.split('.')[-1]] = module
    return generators
