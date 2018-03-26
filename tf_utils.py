#!/usr/bin/python
from __future__ import absolute_import
from __future__ import print_function
from __future__ import division

import os
import re
import sys
import shutil

import tensorflow as tf
import numpy as np
import glob

import helper

epsilon = 1e-9

def tf_get_variable_on_device(name, shape, initializer, device = '/cpu:0', wd = None, trainable=True):
    """Helper to create a Variable stored on CPU memory.
    Args:
      name: name of the variable
      shape: list of ints
      initializer: initializer for Variable
    Returns:
      Variable Tensor
    """
    with tf.device(device):
        var = tf.get_variable(name, shape, initializer=initializer, trainable=trainable)

    if wd is not None:
        weight_decay = tf.multiply(tf.nn.l2_loss(var), wd, name='weight_loss')
        tf.add_to_collection('losses', weight_decay)

    return var

def get_model_varaibles():
    # it assumed all weights and biases are end up with "weights:0" and "biases:0"
    g_varaibles = tf.global_variables()
    model_variables = []
    for v in g_varaibles:
        if "weights:0" in v.name or "biases:0" in v.name:
            model_variables.append(v)
    return model_variables

def get_global_step():
  step = tf.get_collection("GLOBAL_STEP")
  if len(step) == 0:
    global_step = tf.Variable(0, trainable=False, name='global_step')
    tf.add_to_collection("GLOBAL_STEP", global_step)
    step = [global_step]
  return step[0]

def restore_model(config, sess, model_variables, ckpt_for_init, logger=None):
    """ Create a saver with all the trainable variables and the the moving averages of the varaibles for Batchnorm
    """
    if logger == None:
        logger = helper.Logger()
    step_init = 0
    is_continue = False

    # if no pre-trained ckpt is set, initialise from the ImageNet numpy file
    if ckpt_for_init == "":
        if config.model_file != "":
            _init_from_npz(sess, model_variables, config.model_file)
            logger.add("Model initilaised from npz")
        else:
            logger.add("No previous models found or asked to restore. Training from scratch.")

    # else try to load the variables from the ckpt
    # first of all set the correct ckpt_for-init
    else:
        if ckpt_for_init == "continue":
            is_continue = True
            ckpt = tf.train.get_checkpoint_state(config.log_dir)
            if ckpt != None:
                ckpt_for_init = ckpt.model_checkpoint_path
                ckpt_for_init = os.path.join(config.log_dir, ckpt_for_init[ckpt_for_init.rfind('/') +1:])
                # step_init = int(ckpt_for_init[ckpt_for_init.rfind('-')+1:]) +1

        # and now checking for the existing ckpts
        if(len(glob.glob(ckpt_for_init + "*")) > 0):
            """ create a saver with the variables that are in the checkpoint"""
            """ get the variable list in the checkpt"""

            reader = tf.train.NewCheckpointReader(ckpt_for_init)
            var_list = reader.get_variable_to_shape_map()

            """ get the list of trainable variables + bn_variables that are not in fic_dim_variables"""

            # Check the shape and the name of the variable and skip restore if differs
            restore_variables = [a for a in model_variables if var_list.get(a.name.split(":")[0] , "") == a.shape]

            not_restored_var_list =[a.name for a in list(set(model_variables) - set(restore_variables))]
            restore_saver = tf.train.Saver(restore_variables)
            restore_saver.restore(sess, ckpt_for_init)
            logger.add("Model is using the pre-trained weights from {:s}.".format(ckpt_for_init))
            if len(not_restored_var_list) == 0:
                logger.add("All the variables in the graph are restored from checkpoint")
            else:
                logger.add("The below variables are not restored from checkpoint:")
                logger.add(str(not_restored_var_list))
        else:
            utils.add("The given ckpt file {:s} not found. Training from scratch".format(ckpt_for_init))


        step_init = sess.run(get_global_step()) if is_continue else 0
        gs = get_global_step()
        sess.run(gs.assign(step_init))


    # go to next step if global step is restored from the previous model
    if step_init > 0:
        step_init += 1

    logger.print_log()
    return step_init
