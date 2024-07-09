#!/usr/bin/python3

import csv
import json
import pandas
import shutil
import os
from git import Repo

TOKEN_MAP = 'penultimate.csv'
LOGOS_IN_DIR = 'Logos'
LOGOS_OUT_DIR = 'lux-tokens'
ETH_CONFIG = 'ethereum.config'
LUX_CONFIG = 'lux.config'
HOSTED_URL = 'https://raw.githubusercontent.com/luxfi/wallet/main/'

def read_logos():
    token_map = pandas.read_csv(TOKEN_MAP)
    #print(token_map.loc[2:5, ["Lux Token Address", "Ethereum Token Address"]])
    return token_map

def copy_logos(token_map):
    for _, row in token_map.iterrows():
        eth_address = row['Ethereum Token Address']
        lux_address = row['Lux Token Address']
        old_logo = LOGOS_IN_DIR + '/' + eth_address.lower() + '.png'
        out_dir = LOGOS_OUT_DIR + '/' + lux_address
        new_logo = out_dir + '/logo.png'
        os.mkdir(out_dir)
        try:
            shutil.copyfile(old_logo, new_logo)
        except:
            print("Couldn't copy ", row['Ethereum Token Name'], row['Ethereum Token Address'])


def generateEthConfig(token_map):
    out_file = {}
    data_lst = list()
    for _, row in token_map.iterrows():
        data = {}
        data['address'] = row['Ethereum Token Address']
        data['name'] = row['Ethereum Token Name']
        data['symbol'] = row['Ethereum Token Symbol']
        data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row['Lux Token Address'] +  '/logo.png'
        data['resourceId'] = '0x' + row['Resource ID']
        data_lst.append(data)
    out_file['data'] = data_lst
    with open(ETH_CONFIG, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

def generateLuxConfig(token_map):
    out_file = {}
    data_lst = list()
    for _, row in token_map.iterrows():
        data = {}
        data['address'] = row['Lux Token Address']
        data['name'] = row['Lux Token Name']
        data['symbol'] = row['Lux Token Symbol']
        data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row['Lux Token Address'] +  '/logo.png'
        data['resourceId'] = '0x' + row['Resource ID']
        data_lst.append(data)
    out_file['data'] = data_lst
    with open(LUX_CONFIG, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

def uploadLogos():
    repo = Repo('.')
    origin = repo.remotes['origin']
    assert not repo.bare
    #breakpoint()
    #print("Stopper")
    for index, logo in enumerate(repo.untracked_files):
        repo.index.add(logo)
        if (index != 0 and index % 5 == 0) or index == len(repo.untracked_files) - 1:
            repo.index.commit("Uploading logo checkpoint " + str(index / 5))
            origin.push()



def main():
    token_map = read_logos()
    #copy_logos(token_map)
    generateEthConfig(token_map)
    generateLuxConfig(token_map)
    #uploadLogos()

if __name__ == '__main__':
    main()
