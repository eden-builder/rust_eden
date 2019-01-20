use libflate::gzip::Decoder;
use reqwest;
use std::io::{self, Read};

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

pub fn download_world(_name: &'static str) -> io::Result<Decoder<reqwest::Response>> {
    let req = reqwest::get("http://files.edengame.net/1541108087.eden").unwrap();
    Decoder::new(req)
}
