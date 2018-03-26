#!/usr/bin/python
net_config = "exp1"

# dirs
log_dir = "log/exp1/"
data_dir = "data/"

# data
input_csv = data_dir + "data2.csv"

#train_params
deepnet = 'v1'
max_steps = 1000000
batch_size = 10
learning_rate = 0.000001
train_loss =  "least_square_loss" #"fractional_loss"
test_loss =  "fractional_loss" #"fractional_loss"

# pre_trained_files
model_file = ""






