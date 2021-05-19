package main

import (
	"net/http"
	"log"
	"fmt"
)


func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

var fileServer = http.FileServer(http.Dir("./")) // instance of file server handler


type myHandler struct{}

func (myHandler) ServeHTTP(w http.ResponseWriter, req *http.Request){
	enableCors(&w)
	fileServer.ServeHTTP(w, req)
}

func main() {
	fmt.Println("Open URL: http://localhost:8000/ in the browser")
	fmt.Println("Type CTRL-C to stop the server.")
	err := 	http.ListenAndServe(":8000", new(myHandler) )
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
	
}
