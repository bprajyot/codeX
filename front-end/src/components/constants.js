export const LANGUAGE_VERSIONS = {
  // "C++": "C++20",                        // Piston may recognize this as 'cpp', adjust if needed
  python: "3.x", // Use a SemVer-like selector; '3.x' is generally acceptable
  java: "15.0.2", // Capitalized for uniformity
  // "js": "15.10.0",               // Removed stray parenthesis
  // "Kotlin": "1.9.22",                    // Keep version only
  // "Go": "1.22.0",
  // "Rust": "1.77.0-nightly"               // Represent nightly with hyphen rather than parentheses
};

export const CODE_SNIPPETS = {
  "C++": `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  python: `print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  js: `console.log("Hello, World!");`,
  Kotlin: `fun main() {
    println("Hello, World!")
}`,
  Go: `package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}`,
  Rust: `fn main() {
    println!("Hello, World!");
}`,
};
