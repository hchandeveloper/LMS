import React from "react";
import { styles } from "../styles/style";

const About = () => {
  return (
    <div className="text-black dark:text-white">
      <br />
      <h1 className={`${styles.title} 800px:!text-[45px]`}>
        What is <span className="text-gradient">E-learning?</span>
      </h1>
      
      <br />
      <div className="w-[95%] 800px:w-[85%] m-auto">
        <p className="text-[18px] font-Poppins">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
          <br />
          <br />
          Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
          Praesent mauris. Fusce nec tellus sed augue semper porta.
          <br />
          <br />
          Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
          Curabitur sodales ligula in libero.
          <br />
          <br />
          Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean
          quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis
          tristique sem.
          <br />
          <br />
          Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis
          vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula
          lacinia aliquet. Mauris ipsum.
          <br />
          <br />
          Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.
          Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos.
          <br />
          <br />
          Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque
          adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut
          fringilla. Suspendisse potenti.
        </p>
        <br />
        <span className="text-[22px]">Lorem Ipsum</span>
        {/* <h5 className="text-[18px] font-Poppins">
          Founder and CEO of Random Ipsum
        </h5> */}
        <br />
        <br />
        <br />
      </div>
    </div>
  );
};

export default About;
