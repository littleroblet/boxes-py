# UI Flag Enhancement - Support for Multiple Flags

## Summary
Updated `ui_flag` to support both single string and list of strings, allowing generators to display multiple status badges.

## Changes Made

### 1. **boxesserver.py** (Menu and Gallery pages)
- Updated flag rendering to handle `ui_flag` as either:
  - Single string: `ui_flag = "Experimental"`
  - List of strings: `ui_flag = ["Experimental", "Beta"]`
- Generates multiple pill badges when list is provided

### 2. **boxes_main.py** (CLI)
- Updated `group_generators()` to handle `ui_group` as either:
  - Single string: `ui_group = "Display"`
  - List of strings: `ui_group = ["Display", "Games"]`
- Generator will appear in multiple groups

### 3. **boxes/__init__.py** (Core)
- Updated metadata generation to use first group when `ui_group` is a list

## Usage Examples

### Single Flag (Backward Compatible)
```python
class MyGenerator(Boxes):
    ui_group = "Display"
    ui_flag = "Experimental"
```

### Multiple Flags
```python
class MyGenerator(Boxes):
    ui_group = "Display"
    ui_flag = ["Experimental", "Updated"]
```

### Multiple Groups
```python
class MyGenerator(Boxes):
    ui_group = ["Display", "Games"]
    ui_flag = "Beta"
```

### Multiple Groups and Flags
```python
class MyGenerator(Boxes):
    ui_group = ["Display", "Games", "Art"]
    ui_flag = ["Beta", "New"]
```

## Testing

To test the Castle generator with multiple flags:

```python
# In boxes/generators/castle.py
class Castle(Boxes):
    ui_group = ["Display", "Games"]  # Now appears in both groups!
    ui_flag = ["Experimental", "Updated"]  # Shows both badges!
```

## Benefits
1. **Backward Compatible**: All existing generators continue to work
2. **Flexible Categorization**: Generators can belong to multiple groups
3. **Better Status Communication**: Multiple flags can show different aspects (e.g., "Beta" + "Updated")
4. **No Breaking Changes**: Simple string values still work exactly as before
