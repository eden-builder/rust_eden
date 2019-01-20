use libflate::gzip::Decoder;
use reqwest;
use std::collections::HashMap;
use std::io::{self, Cursor, Read, Seek, SeekFrom};
use std::mem::size_of;

pub fn read_struct<T, R: Read>(mut read: R) -> io::Result<T> {
    let num_bytes = ::std::mem::size_of::<T>();
    unsafe {
        let mut s = ::std::mem::uninitialized();
        let buffer = ::std::slice::from_raw_parts_mut(&mut s as *mut T as *mut u8, num_bytes);
        match read.read_exact(buffer) {
            Ok(()) => Ok(s),
            Err(e) => {
                ::std::mem::forget(s);
                Err(e)
            }
        }
    }
}

pub fn download_world(_name: &'static str) -> io::Result<Cursor<Vec<u8>>> {
    let req = reqwest::get("http://files.edengame.net/1541108087.eden").unwrap();
    let mut buffer = Vec::new();
    Decoder::new(req)?.read_to_end(&mut buffer)?;
    Ok(Cursor::new(buffer))
}

#[repr(C)]
pub struct Vector {
    x: f32,
    y: f32,
    z: f32,
}

#[repr(C)]
pub struct WorldFileHeader {
    pub level_seed: i32,
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
pub struct ColumnIndex {
    x: i32,
    z: i32,
    chunk_offset: u64,
}

#[repr(C)]
pub struct Chunk {
    blocks: [[[u8; 16]; 16]; 16],
    colors: [[[u8; 16]; 16]; 16],
}

#[repr(C)]
pub struct Column {
    chunks: [Chunk; 4],
}

pub struct WorldFile {
    cursor: Cursor<Vec<u8>>,
}

impl WorldFile {
    pub fn new(name: &'static str) -> WorldFile {
        WorldFile {
            cursor: download_world(name).unwrap(),
        }
    }

    pub fn header(&mut self) -> WorldFileHeader {
        self.cursor.set_position(0);
        read_struct::<WorldFileHeader, _>(self.cursor.by_ref()).unwrap()
    }

    pub fn directory(&mut self) -> Vec<ColumnIndex> {
        let size = self.cursor.seek(SeekFrom::End(0)).unwrap();
        let offset = self.header().directory_offset;
        self.cursor.set_position(offset);
        (offset..size)
            .step_by(size_of::<ColumnIndex>())
            .filter_map(|_| read_struct::<ColumnIndex, _>(self.cursor.by_ref()).ok())
            .collect()
    }

    fn column(&mut self, pos: u64) -> Column {
        self.cursor.set_position(pos);
        read_struct::<Column, _>(self.cursor.by_ref()).unwrap()
    }
}

impl ColumnIndex {
    pub fn column(&self, world: &WorldFile) -> Column {
        world.column(self.chunk_offset)
    }
}
