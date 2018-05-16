#!/usr/bin/python
# this file provides the utily function to load train, validation, test datasets in the format that needs to train deep-models
import csv
import numpy as np

class DataSet(object):
    def __init__(self, features, output):
        self._num_examples = features.shape[0]
        self._features = features
        self._output = output
        self._epochs_completed = 0
        self._index_in_epoch = 0

    @property
    def features(self):
        return self._features
    @property
    def output(self):
        return self._output
    @property 
    def num_examples(self):
        return self._num_examples
    @property
    def epochs_completed(self):
        return self._epochs_completed 
    
    def next_batch(self, batch_size):
        """Return the next `batch_size` examples from this data set."""
        start = self._index_in_epoch
        self._index_in_epoch += batch_size
        if self._index_in_epoch > self._num_examples:
            # Finished epoch
            self._epochs_completed += 1
            # Shuffle the data
            perm = np.arange(self._num_examples)
            np.random.shuffle(perm)
            self._features = self._features[perm]
            self._output = self._output[perm]
            # Start next epoch
            start = 0
            self._index_in_epoch = batch_size
            assert batch_size <= self._num_examples
        
        end = self._index_in_epoch
        return self._features[start:end], self._output[start:end]

def load_datasets(csv_file):
    class DataSets(object):
        def __init__(self, feat_len):
            self.feat_len = feat_len
    

    with open(csv_file, 'r') as fp:
        input_data  = list(csv.reader(fp))

    # remove the header line 
    header = input_data[0]
    input_data  = np.array(input_data[1:], dtype=np.float32) #(ouput size 70*13)
    
    # last column is output 
    feat_len = input_data.shape[1] -1
    
    # init the datasets class
    datasets = DataSets(feat_len)
    datasets.input_header  = header[:-1]

    #split training_testing we'll allocate 60 rows for training and 10 rows for validation
    train_data = input_data[:60,:] #60*7
    val_data = input_data[60:, :] #10*7

    # get the data normalising paras
    datasets.mu = np.mean(train_data, axis=0)
    datasets.sigma = np.std(train_data, axis=0)

    # normalise data
    train_data  = (train_data - datasets.mu)/ datasets.sigma
    val_data  = (val_data - datasets.mu)/ datasets.sigma

    #split features and the output
    train_features = train_data[:,:feat_len]
    train_output = train_data[:,feat_len:]

    val_features = val_data[:, :feat_len]
    val_output = val_data[:,feat_len:]
    
    #add train and test dataset to Datasets
    datasets.train = DataSet(train_features, train_output)
    datasets.val = DataSet(val_features, val_output)

    #print the summary of the loaded dataset
    print("\n\n summary of the loaded dataset")
    print("--------------------------------")
    print("train  features :" + str(datasets.train.features.shape[0]))
    print("val features :" + str(datasets.val.features.shape[0]))
    return datasets

if __name__ == "__main__":    
    csv_file = "data/data1.csv"
    data = load_datasets(csv_file)


    