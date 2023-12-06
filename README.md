<style>
    body {
        background: #333;
        color: white;
    }
    .Sleezzi {
        text-align: center;
    }
    a {
        text-decoration: none;
        color: unset;
        transition: color 0.3s, text 0.3s, content 0.5s;
    }
    h1 {
        text-align: center;
        transition: content 5s;
    }
    h1:hover::before {
        content: "<==#|| ";
        color: white;
    }
    h1:hover::after {
        content: " ||#==>";
        color: white;
    }
    a:hover {
        text-decoration: underline;
        color: #0080ff;
    }
    a.Sleezzi:hover > h4:before {
        content: " ";
        position: relative;
        animation-name: textBeforeAnimate;
        animation-duration: 0.55s;
        animation-iteration-count: infinite;
        color: gold;
    }
    a.Sleezzi:hover > h4:after {
        content: " ";
        color: gold;
        position: relative;
        animation-name: textAfterAnimate;
        animation-duration: 0.55s;
        animation-iteration-count: infinite;
    }
    @keyframes textBeforeAnimate {
        0% {
            content: "|  "
        }
        33% {
            content: "/  "
        }
        66% {
            content: "-- "
        }
        100% {
            content: "\\  "
        }
    }
    @keyframes textAfterAnimate {
        0% {
            content: "  |"
        }
        33% {
            content: "  \\"
        }
        66% {
            content: " --"
        }
        100% {
            content: "  /"
        }
    }
</style>
<h1>DarkReader</h1>
<h3>What is it?</h3>
<p>ㅤDarkReader is a browser extension, it allows you to browse the internet with a dark mode. Unlike its competitors, it is 100% free, easy to use, and does not collect any data. It can support certain sites in a personalized way, which offers you unparalleled browsing comfort.<br>The css code is created by the community and is then verified by one of our moderators, which offers you optimal security.</p>
<h3>Download</h3>
<p>ㅤTo download DarkReader, go to the <a href="https://sleezzi.github.io" target="_blank">DarkReader's</a> website
 and follow the instructions.</p>
<h3>Related projects</h3>
<ul>
    <li><a href="https://github.com/Sleezzi/YouTubeBookmarkExtension" target="_blank" rel="noopener noreferrer">YouTube Bookmark</a></li>
</ul>
<h4 style="text-align: center;">Author</h4>
<a href="https://github.com/Sleezzi" class="Sleezzi" target="_blank">
    <h4>Sleezzi</h4>
</a>