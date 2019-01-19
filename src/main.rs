use std::fs::File;
use std::io;

mod helper;

#[derive(Debug)]
#[repr(C)]
struct Vector {
    x: f32,
    y: f32,
    z: f32,
}

#[repr(C)]
struct WorldFileHeader {
    level_seed: i32,
    pos: Vector,
    home: Vector,
    yaw: f32,
    directory_offset: u64,
    name: [i8; 50],
    version: i32,
    hash: [i8; 36],
    skycolors: [u8; 16],
    goldencubes: i32,
    _reserved: [i8; 40],
}

fn main() -> io::Result<()> {
    let f = File::open("1541108087.eden")?;

    let header = helper::read_struct::<WorldFileHeader, _>(&f)?;
    let header2 = helper::read_struct::<WorldFileHeader, _>(&f)?;

    println!("{:?}", header.pos);
    println!("{:?}", header2.pos);

    Ok(())
}
