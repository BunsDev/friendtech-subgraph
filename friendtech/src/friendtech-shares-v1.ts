import { BigInt } from '@graphprotocol/graph-ts';

import { Trade as TradeEvent } from '../generated/FriendtechSharesV1/FriendtechSharesV1';
import { Trade, Subject } from '../generated/schema';

export function handleTrade(event: TradeEvent): void {
  let trade = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  trade.trader = event.params.trader;
  trade.subject = event.params.subject;
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

  // Now, update the Subject entity based on the trade event
  let subject = Subject.load(event.params.subject.toHexString());
  if (subject == null) {
    subject = new Subject(event.params.subject.toHexString());
    subject.subject = event.params.subject;
    subject.earnedFees = BigInt.fromI32(0);
    subject.keySupply = BigInt.fromI32(0);
    subject.trades = BigInt.fromI32(0);
    subject.tradedShares = BigInt.fromI32(0);
  }

  // Update the fields of Subject based on the trade event
  subject.earnedFees = subject.earnedFees.plus(event.params.subjectEthAmount);
  subject.trades = subject.trades.plus(BigInt.fromI32(1));
  subject.tradedShares = subject.tradedShares.plus(event.params.shareAmount);

  subject.save();
}
