"""Makes helper libraries available in the tmvdeep package."""
from __future__ import absolute_import
from __future__ import print_function
from __future__ import division


import importlib
import json
import os
import sys

class Config(object):
    def __init__(self, net_config=None):
        # set of net config files used to set th params of Config
        self.net_configs = [net_config]
        # config params in dict format
        self.config_dict = {}
        # config params in str format to printout
        self.config_str = ""
        #update the config class with the provided initial net_config
        self.add_config(net_config)

    def add_config(self, net_config):
        #update the config class with the provided initial net_config

        # convert netconfig to dict and str format
        config_dict = self._get_config_dict(net_config)
        config_str = self._get_config_str(config_dict)
        
        # update the module params
        self.net_configs.append(net_config)
        self.config_dict = self.config_dict.update(config_dict)
        self.config_str += config_str

        #update the module params for the new net_config
        for key in config_dict:
            setattr(self, key, config_dict[key])
        return self

    def _get_config_dict(self, net_config):
        #get the config params in key-val pair to the Config Class
        config_dict = {}
        if net_config != None:
            config_mod = importlib.import_module("configs." + net_config)
            config_dict = {key: value for key, value in config_mod.__dict__.iteritems() if not (key.startswith('__') or key.startswith('_'))}
        return config_dict

    def _get_config_str(self, config_dict):
        # convert config dict to string format
        return ''.join(['{:s} : {:s}\n'.format(str(key), str(config_dict[key])) for key in config_dict])



