export const SAMPLES: { name: string; language: string; code: string }[] = [
  {
    name: "Python – Factorial",
    language: "Python",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
  },
  {
    name: "Python – Even numbers",
    language: "Python",
    code: `numbers = [1, 2, 3, 4, 5, 6]
evens = [x for x in numbers if x % 2 == 0]
print("Even numbers:", evens)`,
  },
  {
    name: "Java – Sum of array",
    language: "Java",
    code: `public class Main {
    public static void main(String[] args) {
        int[] nums = {3, 7, 1, 9};
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        System.out.println("Sum = " + sum);
    }
}`,
  },
  {
    name: "JavaScript – Reverse string",
    language: "JavaScript",
    code: `function reverse(str) {
  return str.split("").reverse().join("");
}

console.log(reverse("hello"));`,
  },
  {
    name: "C – Swap",
    language: "C",
    code: `#include <stdio.h>

int main() {
    int a = 5, b = 10, t;
    t = a; a = b; b = t;
    printf("a=%d b=%d\\n", a, b);
    return 0;
}`,
  },
];
