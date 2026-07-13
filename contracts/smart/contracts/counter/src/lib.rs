#![no_std]

use soroban_sdk::contract;
use soroban_sdk::contractimpl;
use soroban_sdk::contracttype;
use soroban_sdk::symbol_short;
use soroban_sdk::Address;
use soroban_sdk::Env;
use soroban_sdk::String;
use soroban_sdk::Symbol;
use soroban_sdk::Vec;

const TX_COUNT_KEY: Symbol = symbol_short!("TX_COUNT");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payment {
    pub id: u32,
    pub sender: Address,
    pub recipient: Address,
    pub amount: u64,
    pub memo: String,
    pub timestamp: u64,
}

fn timestamp(env: &Env) -> u64 {
    env.ledger().timestamp()
}

fn get_tx_count(env: &Env) -> u32 {
    env.storage()
        .persistent()
        .get(&TX_COUNT_KEY)
        .unwrap_or(0)
}

fn set_tx_count(env: &Env, count: u32) {
    env.storage().persistent().set(&TX_COUNT_KEY, &count);
}

fn store_tx(env: &Env, id: u32, payment: &Payment) {
    let key = symbol_short!("PAYMENT");
    env.storage().persistent().set(&(key, id), payment);
}

fn get_tx(env: &Env, id: u32) -> Option<Payment> {
    let key = symbol_short!("PAYMENT");
    env.storage().persistent().get(&(key, id))
}

#[contract]
pub struct TxLogger;

#[contractimpl]
impl TxLogger {
    pub fn record(
        env: Env,
        caller: Address,
        recipient: Address,
        amount: u64,
        memo: String,
    ) -> u32 {
        caller.require_auth();

        let next_id = get_tx_count(&env) + 1;
        let payment = Payment {
            id: next_id,
            sender: caller,
            recipient,
            amount,
            memo,
            timestamp: timestamp(&env),
        };

        store_tx(&env, next_id, &payment);
        set_tx_count(&env, next_id);

        env.events().publish(
            (symbol_short!("PAYMENT"), symbol_short!("SENT")),
            payment.clone(),
        );

        next_id
    }

    pub fn total_txs(env: Env) -> u32 {
        get_tx_count(&env)
    }

    pub fn get_tx(env: Env, id: u32) -> Option<Payment> {
        get_tx(&env, id)
    }

    pub fn recent_txs(env: Env, start: u32, limit: u32) -> Vec<Payment> {
        let total = get_tx_count(&env);
        let mut result: Vec<Payment> = Vec::new(&env);

        if start > total {
            return result;
        }

        let end = if start.saturating_sub(limit) > 0 {
            start.saturating_sub(limit) + 1
        } else {
            1
        };

        let mut id = start;
        while id >= end {
            if let Some(tx) = get_tx(&env, id) {
                result.push_back(tx);
            }
            if id == 0 {
                break;
            }
            id -= 1;
        }

        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::testutils::Events;
    use soroban_sdk::testutils::Ledger;
    use soroban_sdk::Env;
    use soroban_sdk::String;

    fn setup() -> (Env, TxLoggerClient<'static>, Address, Address) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TxLogger);
        let client = TxLoggerClient::new(&env, &contract_id);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        (env, client, sender, recipient)
    }

    #[test]
    fn test_record() {
        let (env, client, sender, recipient) = setup();

        env.mock_all_auths();
        env.ledger().set_timestamp(1700000000);

        let memo = String::from_str(&env, "test payment");
        let tx_id = client.record(&sender, &recipient, &100, &memo);

        assert_eq!(tx_id, 1);
        assert_eq!(client.total_txs(), 1);

        let stored = client.get_tx(&1).unwrap();
        assert_eq!(stored.id, 1);
        assert_eq!(stored.sender, sender);
        assert_eq!(stored.recipient, recipient);
        assert_eq!(stored.amount, 100);
        assert_eq!(stored.memo, memo);
        assert_eq!(stored.timestamp, 1700000000);
    }

    #[test]
    fn test_multiple_txs() {
        let (env, client, sender, recipient) = setup();

        env.mock_all_auths();
        env.ledger().set_timestamp(1700000000);

        let memo1 = String::from_str(&env, "first");
        let memo2 = String::from_str(&env, "second");
        let memo3 = String::from_str(&env, "third");

        client.record(&sender, &recipient, &50, &memo1);
        client.record(&sender, &recipient, &100, &memo2);
        client.record(&sender, &recipient, &200, &memo3);

        assert_eq!(client.total_txs(), 3);
    }

    #[test]
    fn test_recent_txs() {
        let (env, client, sender, recipient) = setup();

        env.mock_all_auths();
        env.ledger().set_timestamp(1700000000);

        let memo = String::from_str(&env, "tx");
        for i in 1..=5 {
            client.record(&sender, &recipient, &(i * 10), &memo);
        }

        let recent = client.recent_txs(&5, &3);
        assert_eq!(recent.len(), 3);

        assert_eq!(recent.get(0).unwrap().amount, 50);
        assert_eq!(recent.get(1).unwrap().amount, 40);
        assert_eq!(recent.get(2).unwrap().amount, 30);
    }

    #[test]
    fn test_events() {
        let (env, client, sender, recipient) = setup();

        env.mock_all_auths();
        env.ledger().set_timestamp(1700000000);

        let memo = String::from_str(&env, "hello");
        client.record(&sender, &recipient, &99, &memo);

        let events = env.events().all();
        assert_eq!(events.len(), 1);

        let (_, topics, _data) = &events.get(0).unwrap();
        assert_eq!(topics.len(), 2);
    }

    #[test]
    fn test_empty_recent() {
        let (_env, client, _, _) = setup();
        let result = client.recent_txs(&0, &10);
        assert_eq!(result.len(), 0);
    }
}
