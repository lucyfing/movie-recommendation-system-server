class Boy {
    @speak('中文')
    run () {
        console.log(`i can speak ${this.language}`)
        console.log('i can run!')
    }
}

function speak (language) {
    // target：当前类，key：修饰的方法名，descriptor：对方法的描述
    return function(target, key, descriptor) {
        console.log(target)
        console.log(key)
        console.log(descriptor)
        target.language = language
        return descriptor
    }
}

const luke = new Boy()
luke.run()