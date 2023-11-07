import { Trade as TradeEvent } from '../generated/FriendtechSharesV1/FriendtechSharesV1';
import { Trade } from '../generated/schema';

export function handleTrade(event: TradeEvent): void {
  let entity = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.trader = event.params.trader;
  entity.subject = event.params.subject;
  entity.isBuy = event.params.isBuy;
  entity.shareAmount = event.params.shareAmount;
  entity.ethAmount = event.params.ethAmount;
  entity.protocolEthAmount = event.params.protocolEthAmount;
  entity.subjectEthAmount = event.params.subjectEthAmount;
  entity.supply = event.params.supply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
