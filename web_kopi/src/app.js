document.addEventListener('alpine:init', () => {
    // ({}) = ini artinya funggsi callback mengembalikan object, karena kita butuh datanya
    Alpine.data('products', () => ({
        items: [{
                id: 1,
                name: 'Robusta Lampung',
                img: '1.jpg',
                price: 20000
            },
            {
                id: 2,
                name: 'Robusta Brazil',
                img: '2.jpg',
                price: 25000
            },
            {
                id: 3,
                name: 'Arabica Wamena',
                img: '3.jpg',
                price: 30000
            },
            {
                id: 4,
                name: 'Aceh Gayo Blend',
                img: '4.jpg',
                price: 35000
            },
            {
                id: 5,
                name: 'Bali Kintamani',
                img: '5.jpg',
                price: 40000
            }
        ]
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            //cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            //jika belum ada / cart masih kosong
            if (!cartItem) {
                // kita tambahkan komponen object baru caranya kita sprite dulu, kita pecah jadi object smbil nambah komponen baru caranya this.items.push({...newItem, quantity:1, total:newItem.price});
                this.items.push({
                    ...newItem,
                    quantity: 1,
                    total: newItem.price
                });
                // ini untuk menghitung quantity dari keseluruhan barang yang ada di cart
                this.quantity++;
                this.total += newItem.price;
            } else {
                // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
                this.items = this.items.map((item) => {
                    //jika barang berbeda
                    if (item.id !== newItem.id) {
                        // maka kita keluar aja return item nya, ia akan menjadi barang baru
                        return item;
                    } else {
                        //jika barang sudah ada, maka tambah quantity dan subtotalnya
                        // ini untuk menghitung quantity dari sebuah item
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        // lalu jika ada barang yang sama , kita harus ubah juga keseluruhan 
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                })
            }
        },
        remove(id) {
            //kita akan ambil item yang mau diremove berdasarkan id
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1 maka
            if (cartItem.quantity > 1) {
                // maka kita telusuri 1 per 1
                this.items = this.items.map((item) => {
                    // jika bukan barang yang di klik, yaudah skip aja
                    if (item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    };
                });
            } else if (cartItem.quantity === 1) {
                // jika barang nya sisa 1
                //this.items akan berisi sebuah barang kecuali barang yang kita click, kita bikin array baru yang berisinya sama dengan = array lama tapi tidak ada barang yang di click
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});
zz

// Form Validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;


//validasinya kita gk mau ada satupun elemen input yang kosong, kita telusuri semua input, cek ada valuenya yg, kalau belom atau kosong tombol akan tetap disabled. tapi jika semua udh keisi maka nyalakan tombolnya 
// yang pertama kita ambil dulu form nya dengan cara
const form = document.querySelector('#checkoutForm');
form.addEventListener('keyup', function () {
    for (let i = 0; i < form.elements.lenght; i++) {
        if (form.elements[i].value.lenght !== 0) {
            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});


// kirim data ketika chackout di klik
checkoutButton.addEventListener('click', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    // const message = formatMessage(objData);
    // window.open(`http://wa.me/628551996045?text=` + encodeURIComponent(message));

    // minta transaction token menggunakan ajax atau fatch
    try {
        const response = await fetch('php/placeOrder.php', {
            method: `POST`,
            body: data,
        });
        const token = await response.text();
        window.snap.pay(token);

    } catch (err) {
        console.log(err.message);
    }


});

//format pesan whatsapp 
const formatMessage = (obj) => {
    return `data customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})\n`)}
Total:${rupiah(obj.total)}
Terima kasih.`
};


// konversi price ke rupiah
const rupiah = (number) => {
    return Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number)
};