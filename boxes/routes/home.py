"""
Home route - main landing page for Boxes.py
"""


def serveHome(server, environ, start_response, lang):
    """Serve the Home page using Jinja2 template."""
    _ = lang.gettext
    lang_name = lang.info().get('language', None)

    start_response("200 OK", [('Content-type', "text/html; charset=utf-8")])

    # Prepare box data for favorites
    boxes_data = []
    for name, box_cls in server.boxes.items():
        boxes_data.append({
            'name': name,
            'label': getattr(box_cls, 'label', name),  # Use label if available, else name
            'description': box_cls.__doc__ if box_cls.__doc__ else '',
            'thumbnail': f"{server.static_url}/samples/{name}-thumb.jpg"
        })

    # Render the template
    template = server.jinja_env.get_template('home.html')
    html_content = template.render(
        static_url=server.static_url,
        language=lang_name,
        boxes=boxes_data,
        _=_
    )
    
    return [html_content.encode("utf-8")]
