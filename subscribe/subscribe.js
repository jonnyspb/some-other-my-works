class Subscribe {
    constructor() {
        this.subscribeForm = {
            element:document.querySelector('.subscribe__form'),
            input:document.querySelector('.subscribe__input[name="email"]'),
            resultBox:document.querySelector('.subscribe__result'),
        }
        this.subscribeForm.element.addEventListener('submit', e => {
            e.preventDefault()
            this.submitter = this.subscribeForm.element.querySelector('[type="submit"]')
            this.handleSubmit()
        })
    }
    handleSubmit() {
        this.subscribeForm.resultBox.innerHTML = ''
        if (!this.validateForm()) return
        const data = {
                'action'    : 'subscribeUser',
                'nonce'     : window.bt.nonce,
                'email'     : document.querySelector('.subscribe__input[name="email"]').value
            }
        this.submitter.classList.add('is-loading')

        fetch(window.bt.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: this.encodeFormData(data),
            credentials: 'same-origin'
        })
            .then(res => res.json())
            .then(res => {
                this.submitter.classList.remove('is-loading')
                if (res.success) {
                    this.subscribeForm.element.innerHTML = 'Thank you! Your email has been sent successfully.'
                } else {
                    console.error(res)
                    this.subscribeForm.resultBox.innerHTML = res.data || 'Sorry, error.'
                }
            })
    }

    validateForm() {
        let valid = true

        this.subscribeForm.element.querySelectorAll('.is-required').forEach(el => {
            let field = el.querySelector('[name]')
            if (field.type === 'radio' || field.type === 'checkbox') {

                if (!el.querySelector(':checked')) {
                    el.classList.add('is-invalid')
                    el.querySelectorAll('[name]').forEach(checkInput => {
                        checkInput.addEventListener('change', this.handleInputChange)
                    })

                    valid = false
                } else {
                    el.querySelectorAll('[name]').forEach(checkInput => {
                        checkInput.removeEventListener('change', this.handleInputChange)
                    })
                }
            }
            else if (field.type === 'email' || field.name === 'email'){
                if (!this.validateEmail(field.value) ) {
                    el.classList.add('is-invalid')
                    field.addEventListener('input', this.handleInputChange)
                    valid = false
                }
                else {
                    field.removeEventListener('input', this.handleInputChange)
                }
            }
            else {
                if (!field.value || !field.value.trim()) {
                    el.classList.add('is-invalid')
                    field.addEventListener('input', this.handleInputChange)
                    valid = false
                } else {
                    field.removeEventListener('input', this.handleInputChange)
                }
            }
        })

        return valid
    }

    encodeFormData(data) {
        return Object.keys(data)
            .filter( (key) => data[key] !== null)
            .map(
                (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
            )
            .join('&')
    }

    handleInputChange(e) {
        e.target.closest('.is-required').classList.remove('is-invalid')
    }

    validateEmail(value) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return reg.test(value)
    }
}

export default new Subscribe()