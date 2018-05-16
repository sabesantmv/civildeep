#!/usr/bin/python
import tensorflow as tf
import tf_utils

epsilon = tf_utils.epsilon

loss_configs = {}
def loss(func):
  loss_configs[func.__name__] = func
  return func

def compute_loss(est, gt, loss_func):
    assert loss_func in loss_configs, loss_func + " is not defined"
    return loss_configs[loss_func](est, gt)


## loss functions
@loss
def least_square_loss(est, gt):
    return tf.reduce_mean(tf.square(est - gt)/2)

@loss
def log_fractional_loss(est, gt):
    return tf.reduce_mean(tf.log(tf.abs(1- est / gt) + epsilon))

@loss
def fractional_loss(est, gt):
    return tf.reduce_mean(est / gt)


