#!/usr/bin/python
from __future__ import absolute_import
from __future__ import print_function
from __future__ import division

import tensorflow as tf
import tf_utils
import numpy as np

device_for_variable = '/cpu:0'

def inference(config, input_tensors):
    x = input_tensors["x"]
    keep_prob = input_tensors["keep_prob"]
    feat_len = int(x.shape[1])

    layer = "fc1"
    with tf.variable_scope(layer) as scope:
        kernel = tf_utils.tf_get_variable_on_device('weights', [feat_len, 128], tf.truncated_normal_initializer(stddev=0.01), device=device_for_variable, wd = None)
        biases = tf_utils.tf_get_variable_on_device('biases', [128], tf.constant_initializer(0.1), device=device_for_variable, wd = None)
        fc1 = tf.nn.relu(tf.matmul(x, kernel) + biases, name=layer)
        fc1_drop = tf.nn.dropout(fc1, keep_prob, name='fc1_drop')
        
    layer = "fc2"
    with tf.variable_scope(layer) as scope:
        kernel = tf_utils.tf_get_variable_on_device('weights', [128, 32], tf.truncated_normal_initializer(stddev=0.01), device=device_for_variable, wd = None)
        biases = tf_utils.tf_get_variable_on_device('biases', [32], tf.constant_initializer(0.1), device=device_for_variable, wd = None)
        fc2 = tf.nn.relu(tf.matmul(fc1_drop, kernel) + biases, name= layer)
        fc2_drop = tf.nn.dropout(fc2, keep_prob, name='fc2_drop')

    layer = "output"
    with tf.name_scope(layer) as scope:
        kernel = tf_utils.tf_get_variable_on_device('weights', [32, 1], tf.truncated_normal_initializer(stddev=0.01), device=device_for_variable, wd = None)
        biases = tf_utils.tf_get_variable_on_device('biases', [1], tf.constant_initializer(0.1), device=device_for_variable, wd = None)
        y = tf.add(tf.matmul(fc2_drop, kernel), biases, name=layer)
    return y
