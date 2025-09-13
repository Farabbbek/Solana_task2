use anchor_lang::prelude::*;

declare_id!("8tJhNdGNzxacg9FKTzPzxbXC1uLUET6CreFfujHHppgS");

#[program]
pub mod solana_task2 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
