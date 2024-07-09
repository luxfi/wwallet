#!/usr/bin/python3

import csv
import json
import pandas
import shutil
import os
from git import Repo
from pycoingecko import CoinGeckoAPI

TOKEN_MAP = 'penultimate.csv'
LOGOS_IN_DIR = 'Logos'
LOGOS_OUT_DIR = 'lux-tokens'
ETH_CONFIG_100 = 'ethereum100.config'
LUX_CONFIG_100 = 'lux100.config'
ETH_CONFIG_150 = 'ethereum150.config'
LUX_CONFIG_150 = 'lux150.config'
HOSTED_URL = 'https://raw.githubusercontent.com/luxfi/wallet/main/tokens/'

def read_tokens():
    token_map = pandas.read_csv(TOKEN_MAP)
    #token_map['Lux Token Symbol'] = token_map['Lux Token Symbol'].astype('|S')
    #breakpoint()
    #print(token_map.loc[2:5, ["Lux Token Address", "Ethereum Token Address"]])
    return token_map

def generateEthConfig(token_map):
    out_file = {}
    data_lst = list()
    for _, row in token_map.iterrows():
        data = {}
        data['address'] = row['Ethereum Token Address']
        data['name'] = row['Ethereum Token Name']
        data['symbol'] = row['Ethereum Token Symbol']
        data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row['Lux Token Address'] +  '/logo.png'
        data['resourceId'] = row['Resource ID']
        data_lst.append(data)
    out_file['data'] = data_lst
    with open(ETH_CONFIG_150, 'w') as json_file:
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
        data['resourceId'] = row['Resource ID']
        data_lst.append(data)
    out_file['data'] = data_lst
    with open(LUX_CONFIG_150, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

def luxTop100(token_map):
    cg = CoinGeckoAPI()
    out_file = {}
    data_lst = list()
    notFound = 0
    #token_map["Ethereum Token Name"] = token_map["Ethereum Token Name"].lower()
    token_map['symbol_lower'] = token_map.apply(lambda row : row['Lux Token Symbol'].lower(), axis = 1)
    found = 0
    page = 1
    while found < 100:
        result = cg.get_coins_markets('usd', per_page=250, page=page, order='market_cap_desc')
        #breakpoint()
        for i in range(len(result)):
            #print(result[i])
            #breakpoint()
            row = token_map[token_map["symbol_lower"] == result[i]['symbol'].lower()]
            #if result[i]['symbol'].lower() == 'mkr':
            #    breakpoint()
            if len(row.index) == 0:
                notFound += 1
            elif len(row.index) > 1:
                print("Collision for symbol", result[i]['symbol'])
            else:
                found += 1
                data = {}
                data['address'] = row.iloc[0]['Lux Token Address']
                data['name'] = row.iloc[0]['Lux Token Name']
                data['symbol'] = row.iloc[0]['Lux Token Symbol']
                data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row.iloc[0]['Lux Token Address'] +  '/logo.png'
                data['resourceId'] = '0x' + row.iloc[0]['Resource ID']
                data_lst.append(data)
            if found == 100:
                break
        page += 1
    out_file['data'] = data_lst
    #breakpoint()
    with open(LUX_CONFIG_100, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

    print("Not found:", notFound)

def luxTop150(token_map):
    cg = CoinGeckoAPI()
    out_file = {}
    data_lst = list()
    notFound = 0
    #token_map["Ethereum Token Name"] = token_map["Ethereum Token Name"].lower()
    token_map['symbol_lower'] = token_map.apply(lambda row : row['Lux Token Symbol'].lower(), axis = 1)
    found = 0
    page = 1
    while found < 150:
        result = cg.get_coins_markets('usd', per_page=250, page=page, order='market_cap_desc')
        for i in range(len(result)):
            #print(result[i])
            #breakpoint()
            row = token_map[token_map["symbol_lower"] == result[i]['symbol'].lower()]
            #if result[i]['symbol'].lower() == 'mkr':
            #    breakpoint()
            if len(row.index) == 0:
                notFound += 1
            elif len(row.index) > 1:
                print("Collision for symbol", result[i]['symbol'])
            else:
                found += 1
                data = {}
                data['address'] = row.iloc[0]['Lux Token Address']
                data['name'] = row.iloc[0]['Lux Token Name']
                data['symbol'] = row.iloc[0]['Lux Token Symbol']
                data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row.iloc[0]['Lux Token Address'] +  '/logo.png'
                data['resourceId'] = '0x' + row.iloc[0]['Resource ID']
                data_lst.append(data)
            if found == 150:
                break
        page += 1
    out_file['data'] = data_lst
    #breakpoint()
    with open(LUX_CONFIG_150, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

    print("Not found:", notFound)


def ethTop100(token_map):
    cg = CoinGeckoAPI()
    out_file = {}
    data_lst = list()
    notFound = 0
    #token_map["Ethereum Token Name"] = token_map["Ethereum Token Name"].lower()
    token_map['symbol_lower'] = token_map.apply(lambda row : row['Lux Token Symbol'].lower(), axis = 1)
    found = 0
    page = 1
    while found < 100:
        result = cg.get_coins_markets('usd', per_page=250, page=page, order='market_cap_desc')
        for i in range(len(result)):
            #print(result[i])
            #breakpoint()
            row = token_map[token_map["symbol_lower"] == result[i]['symbol'].lower()]
            #if result[i]['symbol'].lower() == 'mkr':
            #    breakpoint()
            if len(row.index) == 0:
                notFound += 1
            elif len(row.index) > 1:
                print("Collision for symbol", result[i]['symbol'])
            else:
                found += 1
                data = {}
                data['address'] = row.iloc[0]['Ethereum Token Address']
                data['name'] = row.iloc[0]['Ethereum Token Name']
                data['symbol'] = row.iloc[0]['Ethereum Token Symbol']
                data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row.iloc[0]['Lux Token Address'] +  '/logo.png'
                data['resourceId'] = '0x' + row.iloc[0]['Resource ID']
                data_lst.append(data)
            if found == 100:
                break
        page += 1
    out_file['data'] = data_lst
    #breakpoint()
    with open(ETH_CONFIG_100, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

    print("Not found:", notFound)

def ethTop150(token_map):
    cg = CoinGeckoAPI()
    out_file = {}
    data_lst = list()
    notFound = 0
    #token_map["Ethereum Token Name"] = token_map["Ethereum Token Name"].lower()
    token_map['symbol_lower'] = token_map.apply(lambda row : row['Lux Token Symbol'].lower(), axis = 1)
    found = 0
    page = 1
    while found < 150:
        result = cg.get_coins_markets('usd', per_page=250, page=page, order='market_cap_desc')
        for i in range(len(result)):
            #print(result[i])
            #breakpoint()
            row = token_map[token_map["symbol_lower"] == result[i]['symbol'].lower()]
            #if result[i]['symbol'].lower() == 'mkr':
            #    breakpoint()
            if len(row.index) == 0:
                notFound += 1
            elif len(row.index) > 1:
                print("Collision for symbol", result[i]['symbol'])
            else:
                found += 1
                data = {}
                data['address'] = row.iloc[0]['Ethereum Token Address']
                data['name'] = row.iloc[0]['Ethereum Token Name']
                data['symbol'] = row.iloc[0]['Ethereum Token Symbol']
                data['imageUri'] = HOSTED_URL + LOGOS_OUT_DIR + '/' + row.iloc[0]['Lux Token Address'] +  '/logo.png'
                data['resourceId'] = '0x' + row.iloc[0]['Resource ID']
                data_lst.append(data)
            if found == 150:
                break
        page += 1
    out_file['data'] = data_lst
    #breakpoint()
    with open(ETH_CONFIG_150, 'w') as json_file:
        json.dump(out_file, json_file, indent=4)

    print("Not found:", notFound)


def main():
    token_map = read_tokens()
    #copy_logos(token_map)
    #generateEthConfig(token_map)
    #generateLuxConfig(token_map)
    luxTop100(token_map)
    ethTop100(token_map)
    luxTop150(token_map)
    ethTop150(token_map)

if __name__ == '__main__':
    main()
