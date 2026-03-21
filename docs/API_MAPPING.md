# API Mapping

## Generated layer

- `Generated.OrdersService`
- `Generated.SuperOrderService`
- `Generated.PositionsPortfolioService`
- `Generated.ConditionalTriggersService`
- `Generated.ForeverOrderService`
- `Generated.FundsMarginService`
- `Generated.DataApiSService`
- `Generated.EdisService`
- `Generated.StatementsService`
- `Generated.TraderSControlService`
- `Generated.IpSetupService`

## Resource layer

- `client.orders`
- `client.superOrders`
- `client.positions`
- `client.alerts`
- `client.foreverOrders`
- `client.funds`
- `client.charts`
- `client.edis`
- `client.statements`
- `client.traderControls`
- `client.ipSetup`

## Trading-critical wrappers

- Orders and super orders add validation and correlation ID handling
- The generated layer remains available for full raw API coverage
