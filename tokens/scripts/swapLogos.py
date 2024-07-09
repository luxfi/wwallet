#!/usr/bin/python3

import csv
import json
import pandas
import shutil
import os
from git import Repo

OLD_TOKEN_MAP = 'current_mapping_libre.csv'
TOKEN_MAP = 'penultimate.csv'
LOGOS_IN_DIR = 'Logos'
LOGOS_OUT_DIR = 'lux-tokens'
#HOSTED_URL = 'https://raw.githubusercontent.com/luxfi/wallet/main/tokens'

def read_logos():
    token_map = pandas.read_csv(TOKEN_MAP)
    #print(token_map.loc[2:5, ["Lux Token Address", "Ethereum Token Address"]])
    return token_map

def read_old_logos():
    token_map = pandas.read_csv(OLD_TOKEN_MAP)
    #print(token_map.loc[2:5, ["Lux Token Address", "Ethereum Token Address"]])
    return token_map

def swap_logos(token_map, old_token_map):
    for _, row in token_map.iterrows():
        old_row = old_token_map[old_token_map["Lux Token Symbol"] == row['Lux Token Symbol']]
        if len(old_row.index) == 0:
            print("No token for ", row['Lux Token Symbol'], row['Ethereum Token Address'], row['Lux Token Address'])
        elif len(old_row.index) > 1:
            print("Collision for ", row['Lux Token Symbol'])
        else:
            lux_address = row['Lux Token Address']
            old_lux_address = old_row.iloc[0]['Lux Token Address']

            old_out_dir = LOGOS_OUT_DIR + '/' + old_lux_address
            out_dir = LOGOS_OUT_DIR + '/' + lux_address

            #old_logo = old_out_dir + '/logo.png'
            #new_logo = out_dir + '/logo.png'

            #os.mkdir(out_dir)

            try:
                #shutil.move(old_out_dir, out_dir)
                pass
            except:
                print("Couldn't rename ", old_out_dir, out_dir)

def main():
    token_map = read_logos()
    old_token_map = read_old_logos()
    swap_logos(token_map, old_token_map)

if __name__ == '__main__':
    main()
