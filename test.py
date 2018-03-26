#!/usr/bin/python

import tensorflow as tf
import math
import numpy as np
import json
import csv
import os

import sys


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

import deepnets, tf_utils, input_data, configs, helper, loss

def main(net_config, ckpt_for_init):
    
    ## load the config
    config = configs.Config(net_config)

    ## set the logger
    test_dir = os.path.join(config.log_dir, "test")
    log_dir = helper.make_dir([test_dir], re_create_dir = True)
    log_file = os.path.join(log_dir, config.net_config + '_test.txt')
    csv_file = os.path.join(log_dir, config.net_config + '_test.csv')
    logger = helper.Logger(log_file)
    logger.add(config.config_str, do_print=True)

    ## load the dasets from the csv file (train, val, feat_len)
    data = input_data.load_datasets(config.input_csv) # data has train.next_batch(xx) test.images. test.labels
    feat_len = data.feat_len

    ## set the input placeholders
    layer = 'input'
    with tf.name_scope(layer) as scope:
        x = tf.placeholder(tf.float32, [None, feat_len], name='input')
        y = tf.placeholder(tf.float32, [None, 1], name = 'output')
        keep_prob = tf.constant(1.0, name = 'keep_prob')

    ## call inference and compute the output
    y_ = deepnets.inference(config, input_tensors = {"x": x, "keep_prob": keep_prob})

    ## set the global step
    global_step = tf_utils.get_global_step()

    ## tensors to compute the validatoin loss
    with tf.name_scope('validation') as scope:
        val_loss = loss.compute_loss(est=y_, gt=y, loss_func= config.test_loss)
        val_summary =  tf.summary.scalar('val_loss', val_loss)

    init_op = tf.initialize_all_variables()
    sess = tf.Session()
    sess.run(init_op)

    ## saving and restoring operations
    restore_variables = tf_utils.get_model_varaibles() +\
                        tf.get_collection("GLOBAL_STEP")+\
                        tf.get_collection('BN_VARIABLES')
    saver = tf.train.Saver(restore_variables)
    step_init = tf_utils.restore_model(config, sess, restore_variables, ckpt_for_init, logger)

    summary_writer = tf.summary.FileWriter(log_dir, sess.graph)

    # do the validation
    features = np.concatenate((data.train.features, data.val.features), axis=0)
    output= np.concatenate((data.train.output, data.val.output), axis=0)
    feed = {x:features, y: output}
    est, v_loss, v_summary = sess.run([y_, val_loss, val_summary], feed_dict=feed)

    headers = ','.join(data.input_header) + ", gt-y, est-y"
    vals = np.concatenate((features, output, est), axis=1)
    np.savetxt(csv_file, vals, header= headers, delimiter=",")
    summary_writer.add_summary(v_summary, step_init)
    logger.add('val_loss {:f}'.format(v_loss), do_print=True)
    logger.save()


if __name__ == "__main__":
    net_config = "exp1"
    ckpt_for_init = "continue"
    main(net_config=net_config, ckpt_for_init=ckpt_for_init)