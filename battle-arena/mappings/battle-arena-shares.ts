import { BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { Trade as TradeEvent } from '../generated/BattleArena/BattleArena';
import { Trade } from '../generated/schema';
import { createOrLoadSubject } from './helpers';

export function handleTrade(event: TradeEvent): void {
  /**
   * Load or create Subject entity first
   */
  let subject = createOrLoadSubject(event.params.subject);

  /**
   * Create Trade entity and set the foreign key to Subject
   */
  let trade = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  trade.trader = event.params.trader;
  trade.subject = subject.id; // Set the foreign key to Subject's ID
  trade.isBuy = event.params.isBuy;
  trade.shareAmount = event.params.shareAmount;
  trade.ethAmount = event.params.ethAmount;
  trade.protocolEthAmount = event.params.protocolEthAmount;
  trade.subjectEthAmount = event.params.subjectEthAmount;
  trade.supply = event.params.supply;

  trade.blockNumber = event.block.number;
  trade.blockTimestamp = event.block.timestamp;
  trade.transactionHash = event.transaction.hash;

  trade.save();

  /**
   * Update Subject entity based on the trade event
   */
  subject.earnedFees = subject.earnedFees.plus(event.params.subjectEthAmount);
  subject.keySupply = event.params.supply;
  subject.trades = subject.trades.plus(BigInt.fromI32(1));
  subject.tradedShares = subject.tradedShares.plus(event.params.shareAmount);

  // Calculate keyPrice based on the SQL calculation
  const keySupply = subject.keySupply.toBigDecimal();
  const keyPriceNumerator = keySupply.times(keySupply);
  const keyPriceDenominator = BigDecimal.fromString('16000');
  const keyPrice = keyPriceNumerator.div(keyPriceDenominator);
  subject.keyPrice = keyPrice;

  // Calculate market cap
  const marketCap = keySupply
    .times(keySupply.plus(BigDecimal.fromString('1')))
    .times(
      keySupply
        .times(BigDecimal.fromString('2'))
        .plus(BigDecimal.fromString('1'))
    )
    .div(BigDecimal.fromString('96000'));
  subject.marketCap = marketCap;

  subject.save();
}
