import numpy as np
import scipy.io
import os

def parse_mat_array(name):
# TODO
# Make the code more generic. Not only for 3-D arrays
#

    proj_path = os.path.abspath(os.path.dirname(__file__))
    rel_path = "../data/" + name + ".mat"
    path_str = os.path.join(proj_path, rel_path)
    print(path_str)
    mat = scipy.io.loadmat(path_str)
    x = mat[name]
    out = np.nan * np.ones(x.shape, dtype=object)

    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            for k in range(out.shape[2]):
                out[i, j, k] = x[i, j, k][0]

    return out