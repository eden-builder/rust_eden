use std::io;

mod utils;

fn main() -> io::Result<()> {
    let mut world = utils::WorldFile::new("1541108087");
    let header = world.header();

    println!("{}", header.level_seed);

    let column_indexes = world.directory();
    let col = column_indexes[0].column(&world);

    Ok(())
}
