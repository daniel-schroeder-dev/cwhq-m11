import http.server
import socketserver

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)



PORT = 8000
my_server = socketserver.TCPServer(("", PORT), MyHttpRequestHandler)

# Start the server
print("Server up at port: ", PORT)
my_server.serve_forever()
