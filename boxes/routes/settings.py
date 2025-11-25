"""
Settings route - application settings and preferences
"""


def serveSettings(server, environ, start_response, lang):
    """Serve the Settings page using Jinja2 template."""
    _ = lang.gettext
    lang_name = lang.info().get('language', None)

    start_response("200 OK", [('Content-type', "text/html; charset=utf-8")])

    # Render the template
    template = server.jinja_env.get_template('settings.html')
    html_content = template.render(
        static_url=server.static_url,
        language=lang_name
    )
    
    return [html_content.encode("utf-8")]
