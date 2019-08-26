let i=$('#ID')[0].innerText
        $.ajax({
            url: '/getdetails/' + i,
            method: 'get',
            success: (data) => {
                $('#name').html(`${data[0].name}`)
                $('#email').html(`${data[0].email}`)
                $('#dob').html(`${data[0].dob}`)
                $('#address').html(`${data[0].address}`)
                $('#phone').html(`${data[0].phone}`)
                $('#schoolname').html(`${data[0].schoolname}`)
                $('#schoolmarks').html(`${data[0].schoolmarks}%`)
                $('#hname').html(`${data[0].hname}`)
                $('#hcourse').html(`${data[0].hcourse}`)
                $('#hmarks').html(`${data[0].hmarks}`)
                $('#dept').html(`${data[0].dept}`)
                $('#desig').html(`${data[0].desig}`)
                $('#projects').html(`${data[0].projects}`)
            }
        })