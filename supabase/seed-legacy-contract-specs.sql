-- Legacy reference values transcribed from the supplied ICT Futures dataset.
-- They remain unverified; do not rely on these values for live orders until official exchange reconciliation.
insert into public.contract_specs (market_id, exchange, contract_name, standard_symbol, micro_symbol, multiplier, tick_size, tick_value, point_value, settlement_type, active_month_cycle, exchange_spec_url, verification_status)
values
('nq','CME','Nasdaq-100 E-mini · NQ / MNQ','NQ','MNQ',NULL,0.25,5,20,NULL,NULL,'https://www.cmegroup.com/markets/equities/nasdaq/e-mini-nasdaq-100.contractSpecs.html','unverified'),
('es','CME','S&P 500 E-mini · ES / MES','ES','MES',NULL,0.25,12.5,50,NULL,NULL,'https://www.cmegroup.com/markets/equities/sp/e-mini-sandp500.contractSpecs.html','unverified'),
('gc','COMEX','Gold · GC / MGC','GC','MGC',NULL,0.1,10,100,NULL,NULL,'https://www.cmegroup.com/markets/metals/precious/gold.contractSpecs.html','unverified'),
('6e','CME','Euro FX · 6E / M6E','6E','M6E',NULL,5e-05,6.25,NULL,NULL,NULL,'https://www.cmegroup.com/markets/fx/g10/euro-fx.contractSpecs.html','unverified'),
('6b','CME','British Pound · 6B / M6B','6B','M6B',NULL,0.0001,6.25,NULL,NULL,NULL,'https://www.cmegroup.com/markets/fx/g10/british-pound/specs.html','unverified'),
('ym','CBOT','Dow E-mini · YM / MYM','YM','MYM',NULL,1,5,5,NULL,NULL,'https://www.cmegroup.com/markets/equities/dow-jones/e-mini-dow.contractSpecs.html','unverified'),
('rty','CME','Russell 2000 · RTY / M2K','RTY','M2K',NULL,0.1,5,50,NULL,NULL,'https://www.cmegroup.com/markets/equities/russell/e-mini-russell-2000.contractSpecs.html','unverified'),
('dx','ICE US','US Dollar Index · DX','DX',NULL,NULL,0.005,5,1000,NULL,NULL,'https://www.ice.com/products/194/US-Dollar-Index-USDX-Futures','unverified'),
('zn','CBOT','10-Year T-Note · ZN','ZN',NULL,NULL,0.015625,15.625,1000,NULL,NULL,'https://www.cmegroup.com/markets/interest-rates/us-treasury/10-year-us-treasury-note.contractSpecs.html','unverified'),
('cl','NYMEX','WTI Crude Oil · CL / MCL','CL','MCL',NULL,0.01,10,1000,NULL,NULL,'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.contractSpecs.html','unverified'),
('6j','CME','Japanese Yen · 6J','6J','MJY',NULL,5e-07,6.25,NULL,NULL,NULL,'https://www.cmegroup.com/markets/fx/g10/japanese-yen.contractSpecs.html','unverified'),
('6a','CME','Australian Dollar · 6A','6A','M6A',NULL,5e-05,5,NULL,NULL,NULL,'https://www.cmegroup.com/markets/fx/g10/australian-dollar.contractSpecs.html','unverified'),
('6c','CME','Canadian Dollar · 6C','6C','MCD',NULL,5e-05,5,NULL,NULL,NULL,'https://www.cmegroup.com/markets/fx/g10/canadian-dollar.contractSpecs.html','unverified'),
('si','COMEX','Silver · SI / SIL','SI','SIL',NULL,0.005,25,5000,NULL,NULL,'https://www.cmegroup.com/markets/metals/precious/silver.contractSpecs.html','unverified'),
('btc','CME','CME Bitcoin · BTC / MBT','BTC','MBT',NULL,5,25,5,NULL,NULL,'https://www.cmegroup.com/markets/cryptocurrencies/bitcoin/bitcoin/specs','unverified')
on conflict (market_id) do update set
 exchange=excluded.exchange, contract_name=excluded.contract_name,
 standard_symbol=excluded.standard_symbol, micro_symbol=excluded.micro_symbol,
 multiplier=excluded.multiplier, tick_size=excluded.tick_size, tick_value=excluded.tick_value,
 point_value=excluded.point_value, exchange_spec_url=excluded.exchange_spec_url,
 verification_status='unverified';
