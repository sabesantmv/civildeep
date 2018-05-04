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
    re_create_dir = False
    if ckpt_for_init == "":
        re_create_dir = True
    log_dir = helper.make_dir([config.log_dir], re_create_dir = re_create_dir)
    log_file = os.path.join(log_dir, config.net_config + '.info')
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
        keep_prob = tf.placeholder(tf.float32, name = 'keep_prob')

    ## call inference and compute the output
    y_ = deepnets.inference(config, input_tensors = {"x": x, "keep_prob": keep_prob})

    ## set the global step
    global_step = tf_utils.get_global_step()

    ## do training
    with tf.name_scope('training') as scope:
        train_loss = loss.compute_loss(est=y_, gt=y, loss_func= config.train_loss)
        train_summary =  tf.summary.scalar('train_loss', train_loss)
        # train_step = tf.train.GradientDescentOptimizer(LEARNING_RATE).minimize(train_cost)
        train_step = tf.train.AdamOptimizer(config.learning_rate).minimize(train_loss, global_step=global_step)
    
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

    
    # write the graph (both txt and binary)
    tf.train.write_graph(sess.graph_def, log_dir, config.net_config + '_graph.pb', as_text=False)
    tf.train.write_graph(sess.graph_def, log_dir, config.net_config + '_graph.txt', as_text=True)

    summary_writer = tf.summary.FileWriter(log_dir, sess.graph)

    # only saving the checkpoints if the loss is better than the previous one
    last_saved_loss = 100.0
    for step in range(step_init, config.max_steps):
        # do the optimisation 
        batch_x, batch_y = data.train.next_batch(config.batch_size)
        feed = {x: batch_x, y:batch_y, keep_prob: 0.6}
        _, t_loss, t_summary = sess.run([train_step, train_loss, train_summary], feed_dict=feed)
        summary_writer.add_summary(t_summary, step)

        # do the validataion for every 10th step
        if(step%10 ==0):
            feed = {x:data.val.features, y: data.val.output, keep_prob: 1.0}
            v_loss, v_summary = sess.run([val_loss, val_summary], feed_dict=feed)
            summary_writer.add_summary(v_summary, step)
        
        #save the model for every 500th step
        if(step%500 ==0):
            logger.add('step {:05d} | train_loss {:f} |  val_loss {:f}'.format(step, t_loss, v_loss), do_print=True)
            if v_loss < last_saved_loss:
                checkpoint_path = os.path.join(log_dir,  config.net_config + '.ckpt')
                saver.save(sess, checkpoint_path, global_step=step)
                logger.save()
                last_saved_loss = v_loss


if __name__ == "__main__":
    net_config = "exp1"
    ckpt_for_init = "continue"
    main(net_config=net_config, ckpt_for_init=ckpt_for_init)