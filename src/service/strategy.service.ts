import randomstring from "randomstring"

interface RefStrategy {
  generate(date: string, bookingId: string): string
}

class RandomStrategy implements RefStrategy {
  generate(): string {
    const ref = randomstring.generate({
      length: 8,
      charset: "alphanumeric"
    });
    console.log("ref =>", ref)
    return ref
  }
}

class DerivedStrategy implements RefStrategy {
  generate(date: string, bookingId: string): string {
    const ref = `${bookingId}-${date}`
    return ref
  }
}

class BookingRef {
  private refStrategy: RefStrategy;
  constructor(refStrategy: RefStrategy){
    this.refStrategy = refStrategy;
  }
  generateRef(date: string, bookingId: string) {
    return this.refStrategy.generate(date, bookingId)
  }
}

const derivedStrategy = new BookingRef(new DerivedStrategy);
const randomStrategy = new BookingRef(new RandomStrategy)

export {
  derivedStrategy,
  randomStrategy
}