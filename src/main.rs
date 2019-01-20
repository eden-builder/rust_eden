use std::collections::HashMap;
use std::fs::{metadata, File};
use std::io;
use std::mem::size_of;
use std::path::Path;

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

fn main() -> io::Result<()> {
    let p = Path::new("1541108087.eden");
    let f = File::open(p)?;
    let header = helper::read_struct::<WorldFileHeader, _>(&f)?;
    let columns: HashMap<u64, Column> = (size_of::<WorldFileHeader>() as u64
        ..header.directory_offset)
        .step_by(size_of::<Column>())
        .filter_map(|i| {
            helper::read_struct::<Column, _>(&f)
                .and_then(|x| Ok((i, x)))
                .ok()
        })
        .collect();

    let column_indexes: Vec<ColumnIndex> = (header.directory_offset..metadata(p)?.len())
        .step_by(size_of::<ColumnIndex>())
        .filter_map(|_| helper::read_struct::<ColumnIndex, _>(&f).ok())
        .collect();

    println!("{}", columns.contains_key(&(column_indexes[0].chunk_offset-1)));

    Ok(())
}
