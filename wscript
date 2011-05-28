import Options
from os import unlink, symlink, popen
from os.path import exists 

srcdir = "."
blddir = "build"
VERSION = "0.0.1"

def set_options(opt):
  opt.tool_options("compiler_cxx")
  opt.tool_options("compiler_cc")

def configure(conf):
  conf.check_tool("compiler_cxx")
  conf.check_tool("compiler_cc")
  conf.check_tool("node_addon")

def build(bld):
  http_parser = bld.new_task_gen("cc")
  http_parser.source = "deps/http_parser/http_parser.c"
  http_parser.includes = "deps/http_parser/"
  http_parser.name = "http_parser"
  http_parser.target = "http_parser"
  http_parser.ccflags = "-fPIC"
  http_parser.install_path = None

  obj = bld.new_task_gen("cxx", "shlib", "node_addon")
  obj.includes = """
    src/
    deps/http_parser
  """
  obj.add_objects = 'http_parser'
  obj.target = "parser"
  obj.source = "src/node_http_parser.cc"

def shutdown():
  # HACK to get compress.node out of build directory.
  # better way to do this?
  if Options.commands['clean']:
    if exists('lib/parser.node'): unlink('lib/parser.node')
  else:
    if exists('build/default/parser.node') and not exists('lib/parser.node'):
      symlink('../build/default/parser.node', 'lib/parser.node')
