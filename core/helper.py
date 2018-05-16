#!/usr/bin/python
import os
from datetime import datetime
import shutil

# python2/3 compatible input
try:
    input = raw_input
except NameError:
     pass

# Utils realted ot data preocessing
def make_dir(dir_paths, re_create_dir = False):
    logger = Logger()
    if (type(dir_paths) is not list):
        dir_paths = [dir_paths]

    dir_paths_to_send = []
    for dir_path in dir_paths:
        if (os.path.exists(dir_path) and re_create_dir):
            logger.add('I am about to delete {:s}. Are you sure?>'.format(dir_path), do_print=True)
            x = input('(y/n)')
            if not x.lower() == 'y':
                if dir_path[-1] == '/':
                    dir_path = dir_path[:-1]

                src_dir = dir_path[:dir_path.rfind('/')+1]
                prefix = dir_path[dir_path.rfind('/')+1:]
                dir_path = get_next_dir(src_dir, prefix)
                logger.add('I am creating  a new directory {:s}'.format(dir_path), do_print=True)
            else:
                shutil.rmtree(dir_path)

        if not (os.path.exists(dir_path)):
            os.makedirs(dir_path)

        if dir_path[-1] != '/':
            dir_path = dir_path + '/'

        dir_paths_to_send += [dir_path]

    if len(dir_paths_to_send) ==1:
        return dir_paths_to_send[0]
    else:
        return dir_paths_to_send

class Logger(object):
    
    def __init__(self, log_file = None):
        self.log_file = log_file
        self.log_str = self._get_log_str(log_file)
    
    def _get_log_str(self, log_file):
        pre_log = ""
        if log_file != None:
            if os.path.exists(log_file):
                with open(log_file, 'r') as fp:
                    pre_log = fp.read()
        return "{:s}\n=========={:%D/%b/%Y %H:%M:%S}============\n".format(pre_log, datetime.now())

    def add(self, data, sep="\n", do_print = False):
        #assert(data), "data should be string"
        self.log_str = self.log_str + sep + data
        if do_print == True:
            self.print_log()

    def print_log(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        print(self.log_str)

    def clear():
        self.log_str = ""

    def save(self):
        if self.log_file !=None:
            with open(self.log_file, "w") as text_file:
                text_file.write(self.log_str)