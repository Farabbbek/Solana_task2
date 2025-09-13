use anchor_lang::prelude::*;

declare_id!("8tJhNdGNzxacg9FKTzPzxbXC1uLUET6CreFfujHHppgS");

#[program]
pub mod solana_task2 {
    use super::*;

    pub fn initialize_platform(_ctx: Context<InitializePlatform>) -> Result<()> {
        msg!("🎵 Music NFT Platform инициализирована!");
        Ok(())
    }

    pub fn create_music_nft(
        _ctx: Context<CreateMusicNFT>,
        name: String,
        artist: String,
        rarity: String,
    ) -> Result<()> {
        msg!("🎵 Создан NFT: {} от {}, редкость: {}", name, artist, rarity);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMusicNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
