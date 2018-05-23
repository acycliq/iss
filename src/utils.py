import numpy as np
import scipy.io as spio
import os
from shapely.geometry import Point, MultiPoint, Polygon

def parse_mat_array(name):
# TODO
# Make the code more generic. Not only for 3-D arrays
#

    proj_path = os.path.abspath(os.path.dirname(__file__))
    rel_path = "../data/" + name + ".mat"
    path_str = os.path.join(proj_path, rel_path)
    print(path_str)
    mat = spio.loadmat(path_str)
    x = mat[name]
    out = np.nan * np.ones(x.shape, dtype=object)

    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            for k in range(out.shape[2]):
                out[i, j, k] = x[i, j, k]

    return out


def loadmat(filename):
    '''
    this function should be called instead of direct spio.loadmat
    as it cures the problem of not properly recovering python dictionaries
    from mat files. It calls the function check keys to cure all entries
    which are still mat-objects

    from: `StackOverflow <http://stackoverflow.com/questions/7008608/scipy-io-loadmat-nested-structures-i-e-dictionaries>`_
    '''
    data = spio.loadmat(filename, struct_as_record=False, squeeze_me=True)
    return _check_keys(data)


def _check_keys(dict):
    '''
    checks if entries in dictionary are mat-objects. If yes
    todict is called to change them to nested dictionaries
    '''
    for key in dict:
        if isinstance(dict[key], spio.matlab.mio5_params.mat_struct):
            dict[key] = _todict(dict[key])
    return dict


def _todict(matobj):
    '''
    A recursive function which constructs from matobjects nested dictionaries
    '''
    dict = {}
    for strg in matobj._fieldnames:
        elem = matobj.__dict__[strg]
        if isinstance(elem, spio.matlab.mio5_params.mat_struct):
            dict[strg] = _todict(elem)
        else:
            dict[strg] = elem
    return dict


def inpolygon(xq, yq, xv, yv):
    '''
    :param xq:
    :param yq:
    :param xv:
    :param yv:
    :return:
    '''

    # create the polygon
    coords = list(zip(xv, yv))
    poly = Polygon(coords)

    # create a list of Points
    pts = MultiPoint(list(zip(xq, yq)))

    # check if point is inside or on the edge
    isInside = [pt.within(poly) for pt in pts]
    isOn = [pt.touches(poly) for pt in pts]

    out = np.array(isInside) | np.array(isOn)
    return out



def ismember(a, b):
    '''
    From https://stackoverflow.com/questions/15864082/python-equivalent-of-matlabs-ismember-function
    :param a:
    :param b:
    :return:
    '''
    bind = {}
    for i, elt in enumerate(b):
        if elt not in bind:
            bind[elt] = i
    return [bind.get(itm, None) for itm in a]
