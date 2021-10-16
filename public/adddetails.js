$('#adddetails').key((e) => {
    $('#res').html(' ')
    let key=e.target.value
    $.ajax({
        url: '/adddetails/' + key,
        method: 'post',
        success: (data) => {
            for(let i=0; i<data.length; i++){
                $('#res').append(`<li><a href="/employee/${data[i]._id}" class="btn btn-light">${data[i].username}</a></li>`)
            }
        }
    })
})