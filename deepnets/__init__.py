"""Makes helper libraries available in the tmvdeep package."""
from __future__ import absolute_import
from __future__ import print_function
from __future__ import division

import importlib

def inference(config, input_tensors):
    import_str = 'deepnets.' + config.deepnet
    deepnet = importlib.import_module(import_str)
    return deepnet.inference(config, input_tensors)