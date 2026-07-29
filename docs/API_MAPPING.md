# DhanHQ v2 REST API Mapping

Complete mapping of all DhanHQ API v2 endpoints (from [docs.dhanhq.co](https://docs.dhanhq.co/api/v2/) and `docs-export.md`) to the `dhanhq-ts` SDK.

---

## 1. Order Management (`client.orders` / `Generated.OrdersService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /orders` | Place Order | `client.orders.place(params)` | `client.generated.orders.postOrders()` |
| `PUT /orders/{orderId}` | Modify Order | `client.orders.modify(orderId, params)` | `client.generated.orders.putOrders()` |
| `DELETE /orders/{orderId}` | Cancel Order | `client.orders.cancel(orderId)` | `client.generated.orders.deleteOrders()` |
| `GET /orders` | Get Order List / Order Book | `client.orders.list()` | `client.generated.orders.getOrders()` |
| `GET /orders/{orderId}` | Get Order by ID | `client.orders.getById(orderId)` | `client.generated.orders.getOrders1()` |
| `GET /orders/external/{correlationId}` | Get Order by Correlation ID | `client.orders.getByCorrelationId(id)` | `client.generated.orders.getOrdersExternal()` |
| `GET /trades/{orderId}` | Get Trade History by Order ID | `client.orders.getTradeHistory(orderId)` | `client.generated.orders.getTrades()` |
| `POST /orders/slicing` | Slice Order (Iceberg) | `client.orders.slice(params)` | `client.generated.orders.postOrdersSlicing()` |

---

## 2. Super Orders / Bracket Orders (`client.superOrders` / `Generated.SuperOrderService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /super/orders` | Place Super Order (Target/SL) | `client.superOrders.place(params)` | `client.generated.superOrder.postSuperOrders()` |
| `PUT /super/orders/{orderId}` | Modify Super Order | `client.superOrders.modify(id, params)` | `client.generated.superOrder.putSuperOrders()` |
| `DELETE /super/orders/{orderId}/{legId}` | Cancel Super Order Leg | `client.superOrders.cancelLeg(id, leg)`| `client.generated.superOrder.deleteSuperOrders()` |

---

## 3. Forever Orders / GTT (`client.foreverOrders` / `Generated.ForeverOrderService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /forever/orders` | Create Forever (GTT) Order | `client.foreverOrders.place(params)` | `client.generated.foreverOrder.postForeverOrders()` |
| `PUT /forever/orders/{orderId}` | Modify Forever Order | `client.foreverOrders.modify(id, params)` | `client.generated.foreverOrder.putForeverOrders()` |
| `DELETE /forever/orders/{orderId}` | Cancel Forever Order | `client.foreverOrders.cancel(orderId)` | `client.generated.foreverOrder.deleteForeverOrders()` |
| `GET /forever/orders` | List Forever Orders | `client.foreverOrders.list()` | `client.generated.foreverOrder.getForeverOrders()` |

---

## 4. Conditional & Multi-Orders (`client.conditionalTriggers` / `Generated.ConditionalTriggersService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /conditional/orders` | Place Conditional Order | `client.conditionalTriggers.placeConditional()` | `client.generated.conditionalTriggers.postConditionalOrders()` |
| `PUT /conditional/orders/{id}` | Modify Conditional Order | `client.conditionalTriggers.modifyConditional()` | `client.generated.conditionalTriggers.putConditionalOrders()` |
| `DELETE /conditional/orders/{id}` | Delete Conditional Order | `client.conditionalTriggers.deleteConditional()` | `client.generated.conditionalTriggers.deleteConditionalOrders()` |
| `GET /conditional/orders/{id}` | Get Conditional Order by ID | `client.conditionalTriggers.getConditionalById()` | `client.generated.conditionalTriggers.getConditionalOrders1()` |
| `GET /conditional/orders` | Get All Conditional Orders | `client.conditionalTriggers.listConditional()` | `client.generated.conditionalTriggers.getConditionalOrders()` |
| `POST /multi/orders` | Place Multi Order | `client.conditionalTriggers.placeMulti()` | `client.generated.conditionalTriggers.postMultiOrders()` |

---

## 5. Portfolio & Positions (`client.positions`, `client.holdings` / `Generated.PositionsPortfolioService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `GET /positions` | List Positions | `client.positions.list()` | `client.generated.positionsPortfolio.getPositions()` |
| `POST /positions/convert` | Convert Position Product | `client.positions.convert(params)` | `client.generated.positionsPortfolio.postPositionsConvert()` |
| `GET /holdings` | List Holdings | `client.holdings.list()` | `client.generated.positionsPortfolio.getHoldings()` |

---

## 6. Funds & Margin Calculation (`client.funds`, `client.marginCalculator` / `Generated.FundsMarginService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `GET /fundlimit` | Fund Limit / Available Margin | `client.funds.getLimit()` | `client.generated.fundsMargin.getFundlimit()` |
| `POST /margincalculator` | Calculate Single Order Margin | `client.marginCalculator.calculate()` | `client.generated.fundsMargin.postMargincalculator()` |
| `POST /margincalculator/multi` | Calculate Multi-Order Margin | `client.marginCalculator.calculateMulti()` | `client.generated.fundsMargin.postMargincalculatorMulti()` |

---

## 7. Market Data & Charts (`client.marketFeed`, `client.charts`, `client.optionChain`, `client.expiredOptions` / `Generated.DataApiSService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /marketfeed/ltp` | Snapshot LTP for instruments | `client.marketFeed.ltp(req)` | `client.generated.dataApiS.postMarketfeedLtp()` |
| `POST /marketfeed/quote` | Full Quote for instruments | `client.marketFeed.quote(req)` | `client.generated.dataApiS.postMarketfeedQuote()` |
| `POST /charts/intraday` | Intraday Candle History | `client.charts.intraday(req)` | `client.generated.dataApiS.postChartsIntraday()` |
| `POST /charts/historical` | Daily Candle History | `client.charts.historical(req)` | `client.generated.dataApiS.postChartsHistorical()` |
| `POST /optionchain` | Option Chain Data | `client.optionChain.fetch(req)` | `client.generated.dataApiS.postOptionchain()` |
| `POST /optionchain/expirylist` | Option Chain Expiry Dates | `client.optionChain.fetchExpiryList()` | `client.generated.dataApiS.postOptionchainExpirylist()` |
| `POST /expiredoptions` | Expired Options Data | `client.expiredOptions.fetch(req)` | `client.generated.dataApiS.postExpiredoptions()` |
| `GET /instruments/csv` | Compact Scrip Master CSV | `client.instruments.search()` | Internal HTTP fetch |

---

## 8. Trader's Controls (`client.traderControls` / `Generated.TraderSControlService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /tradercontrol/killswitch` | Manage Kill Switch | `client.traderControls.setKillSwitch()` | `client.generated.traderSControl.postTradercontrolKillswitch()` |
| `GET /tradercontrol/killswitch` | Get Kill Switch Status | `client.traderControls.getKillSwitch()` | `client.generated.traderSControl.getTradercontrolKillswitch()` |
| `POST /tradercontrol/pnlexit` | Configure P&L Exit | `client.traderControls.setPnlExit()` | `client.generated.traderSControl.postTradercontrolPnlexit()` |
| `GET /tradercontrol/pnlexit` | Get P&L Exit Config | `client.traderControls.getPnlExit()` | `client.generated.traderSControl.getTradercontrolPnlexit()` |
| `DELETE /tradercontrol/pnlexit` | Stop P&L Exit | `client.traderControls.stopPnlExit()` | `client.generated.traderSControl.deleteTradercontrolPnlexit()` |

---

## 9. EDIS (`client.edis` / `Generated.EdisService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /edis/tpin` | Generate T-PIN | `client.edis.generateTpin()` | `client.generated.edis.postEdisTpin()` |
| `POST /edis/form` | Generate eDIS Form | `client.edis.generateForm()` | `client.generated.edis.postEdisForm()` |
| `GET /edis/inquiry/{isin}` | EDIS Status Inquiry | `client.edis.inquiry(isin)` | `client.generated.edis.getEdisInquiry()` |

---

## 10. IP Whitelisting & Auth (`client.ipSetup`, `client.auth` / `Generated.IpSetupService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `POST /ip/setup` | Set Static IP | `client.ipSetup.setIp()` | `client.generated.ipSetup.postIpSetup()` |
| `GET /ip/setup` | Get Static IP Setup | `client.ipSetup.getIp()` | `client.generated.ipSetup.getIpSetup()` |
| `PUT /ip/setup` | Modify Static IP | `client.ipSetup.modifyIp()` | `client.generated.ipSetup.putIpSetup()` |
| `POST /GenerateAccessToken` | Generate Access Token | `DhanAuth.generateAccessToken()` | Internal HTTP |
| `POST /RenewToken` | Renew Token | `DhanAuth.renewWebToken()` | Internal HTTP |

---

## 11. Statements (`client.statements` / `Generated.StatementsService`)

| HTTP Method & Path | DhanHQ API v2 Feature | SDK Resource Method | Generated Service Method |
|---|---|---|---|
| `GET /statements/ledger` | Ledger Report | `client.statements.ledger()` | `client.generated.statements.getStatementsLedger()` |
| `GET /statements/trades` | Trade History Report | `client.statements.tradeHistory()` | `client.generated.statements.getStatementsTrades()` |

---

## 12. Global Stocks (US Equities) (`client.globalStocks`)

| HTTP Method & Path | Feature | SDK Resource Method |
|---|---|---|
| `GET /v2/globalstocks/marketstatus` | US Market Status | `client.globalStocks.marketStatus.isOpen()` |
| `GET /v2/globalstocks/funds` | US Funds & Limits (USD) | `client.globalStocks.funds.getLimit()` |
| `GET /v2/globalstocks/holdings` | US Holdings List | `client.globalStocks.holdings.list()` |
| `POST /v2/globalstocks/orders` | Place US Order | `client.globalStocks.orders.place()` |
| `POST /v2/globalstocks/costsummary` | US Cost & Margin Summary | `client.globalStocks.costsummary()` |
