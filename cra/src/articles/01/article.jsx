import React from "react";
import image from "./images/img.jpg";
import video from "./videos/screen.mp4";
import { x } from "./huge.js";

export const metadata = {
  title: "IIFE",

  description: `
    What is immediately-invoked function expression and where they might be
    useful.
  `,

  url: "iife",

  datePublication: "2017-07-20 18:00:00",
  dateLastUpdate: "2017-07-20 18:00:00"
};

const Article = () => (
  <article>
    <h2>Article title {x.length}</h2>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam animi
      ipsam cumque dolorem nesciunt a aut consequuntur error libero eum
      reprehenderit, eligendi obcaecati ducimus, optio, delectus ut impedit
      beatae nam.
    </p>

    <br />
    <br />
    <br />
    <img src={image} alt="" width={300} height={300} />
    <video src={video} controls />
  </article>
);
export default Article;
