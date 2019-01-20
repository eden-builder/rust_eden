use std::io;
use std::mem::size_of;

mod utils;

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

#[repr(C)]
struct ColumnIndex {
    x: i32,
    z: i32,
    chunk_offset: u64,
}

#[repr(C)]
struct Chunk {
    blocks: [[[u8; 16]; 16]; 16],
    colors: [[[u8; 16]; 16]; 16],
}

#[repr(C)]
struct Column {
    chunks: [Chunk; 4],
}

use std::io::Cursor;
use std::io::Read;

fn main() -> io::Result<()> {
    let mut c = utils::download_world("1541108087")?;
    let header = utils::read_struct::<WorldFileHeader, _>(c.by_ref())?;

    println!("{}", header.level_seed);
    println!("{}", c.position());

    // let count = (header.directory_offset - size_of::<WorldFileHeader>() as u64)
    //     / size_of::<Column>() as u64;
    // println!("{}", count);

    // let _columns = utils::read_struct::<[Column; 7784], _>(c.by_ref())?;
    // reader.by_ref().take(
    //     (header.directory_offset - size_of::<WorldFileHeader>() as u64)
    //         - 7784 * size_of::<Column>() as u64,
    // );
    // let _indexes = utils::read_struct::<[ColumnIndex; 7784], _>(reader.by_ref())?;

    Ok(())
}
