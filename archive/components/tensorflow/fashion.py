import tensorflow as tf
sess = tf.InteractiveSession()

# constants
PIXEL_DIM = 28
DIM = PIXEL_DIM * PIXEL_DIM
print('using images scaled to %ix%i'%(PIXEL_DIM, PIXEL_DIM))

# import the dataset
