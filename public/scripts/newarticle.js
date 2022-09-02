let articleParagraphs = document.querySelectorAll(".article > div > div > *");
let submitCommentForm = document.querySelector(".submitComments");
let firstSubmit = true;
let url =
  "https://8rj0xswzt3.execute-api.eu-west-1.amazonaws.com/dev/commentative";

// This is a one-off process that happens when an article is first added.
// TODO: Perhaps this should happen as part of the Readability parser process, rather than here.
function addIndexToParagraphs() {
  articleParagraphs.forEach((element, index) => {
    element.setAttribute("data-article-element-index", index + 1);
  });
}

addIndexToParagraphs();

function updateVisibleComments(selectedParagraphReference) {
  console.log("updatingComments");
  const comments = document.querySelectorAll(".comment-block");
  const prevButton = document.querySelector(".prev-comment-button");
  const nextButton = document.querySelector(".next-comment-button");
  let hasComments = false;
  if (comments) {
    comments.forEach((commentBlock) => {
      //commentParagraphReference is the id of the paragraph that the comment has been added to
      let commentParagraphReference = commentBlock.getAttribute(
        "data-article-element-index"
      );
      //if it matches the current selected paragraph then display the comment
      if (commentParagraphReference === selectedParagraphReference) {
        commentBlock.classList.add("currentparagraph");
        hasComments = true;
      }
      //else hide all comments that dont relate to the current paragraph
      else {
        commentBlock.classList.remove("currentparagraph");
        commentBlock.style.display = "none";
      }
    });
    if (hasComments && comments.length > 1) {
      prevButton.style.display = "inline-block";
      nextButton.style.display = "inline-block";
    } else {
      prevButton.style.display = "none";
      nextButton.style.display = "none";
    }
  }
  //display the very first comment for the current paragraph(the rest remain hidden at this point)
  let firstComment = document.querySelector(".currentparagraph");
  if (firstComment) firstComment.style.display = "block";
}

// This is an ongoing check to see which element is in the middle of the screen.
// Then it adds a class 'selected'.
// .selected is the state used so styling knows what to highlight
// and so commenting functionality knows which paragraph index to set as the reference

//variable to keep track of the most recently selected paragraph, to avoid unnecessary updates
let selectedParagraphReference = 0;

window.addEventListener("scroll", (event) => {
  let fromTop = window.scrollY;
  articleParagraphs.forEach((para) => {
    let currentParagraphReference = para.getAttribute(
      "data-article-element-index"
    );
    let paragraphHeight = para.offsetHeight;
    let middleOfWindow = window.innerHeight / 2;
    let viewportTopOffset = para.getBoundingClientRect().top;
    let topBoundary = middleOfWindow - paragraphHeight;
    let bottomBoundary = middleOfWindow;
    if (
      viewportTopOffset <= bottomBoundary &&
      viewportTopOffset >= topBoundary &&
      selectedParagraphReference !== currentParagraphReference
    ) {
      para.classList.add("selected");
      //updates the comment box to show comments with the paragraph index of the currently highlighted paragraph
      updateVisibleComments(currentParagraphReference);
      selectedParagraphReference = currentParagraphReference;
    } else if (selectedParagraphReference !== currentParagraphReference) {
      para.classList.remove("selected");
    }
  });
});

// function to submit comments to backend
function submitComment(e) {
  e.preventDefault();
  //reference is the id of the currently highlighted paragraph
  const reference = document
    .querySelector(".selected")
    .getAttribute("data-article-element-index");
  //body is the text content of the comment
  const body = document.querySelector(".addCommentTextArea").value;
  //dont submit empty comment
  if (body.trim() === "") return;
  const user = "Anonymous User";
  const path = window.location.pathname.split("/");
  const uuid = path[path.length - 1];
  const params = { user, commentData: [{ body, reference }] };
  console.log("hello", url + "/" + uuid);
  fetch(url + "/" + uuid, {
    method: "PUT",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((commentObj) => {
      //the api returns the body and the paragraph index(reference) of the newly created comment
      addNewComment(commentObj[0].body, user, commentObj[0].reference);
      updateVisibleComments(commentObj[0].reference);
      document.querySelector(".addCommentTextArea").value = "";
    });
}
// }

//function to add a new comment to the frontend display
function addNewComment(
  content = "This is a comment",
  name = "Jamie",
  reference
) {
  const commentsBox = document.querySelector(".comments");

  const newCommentBlock = document.createElement("div");
  newCommentBlock.classList.add("comment-block");
  newCommentBlock.setAttribute("data-article-element-index", reference);
  //initially display none, the updateComments function and the comment navigation(showNewComment) change the comments to visible as needed
  newCommentBlock.style.display = "none";
  const commentName = document.createElement("div");
  commentName.classList.add("comment-name");

  const commentContent = document.createElement("div");
  commentContent.classList.add("comment-content");

  commentContent.innerHTML = content;
  commentName.innerHTML = name;

  newCommentBlock.appendChild(commentName);
  newCommentBlock.appendChild(commentContent);

  commentsBox.appendChild(newCommentBlock);
}

document.querySelector(".addComment").addEventListener("click", submitComment);
//the following is to update the comment box as the user types multiple lines
function updateSize(e) {
  let text = e.target.value;
  //regex checks for return and newline, or return, or newline.
  //different platforms have different character inputs for the enter key!!
  //makes the number of rows in the text area the same as the number of new lines in the text.
  e.target.rows = text.split(/\r\n|\r|\n/).length;
}

function keyDownUpdateSize(e) {
  updateSize(e);
}

function keyUpUpdateSize(e) {
  updateSize(e);
}
let commentInput = document.querySelector(".addCommentTextArea");

commentInput.addEventListener("keydown", keyDownUpdateSize);
commentInput.addEventListener("keyup", keyUpUpdateSize);

//The following is for comment navigation
let commentIndex = 1;

function showNewComment(index) {
  let comments = document.querySelectorAll(".currentparagraph");
  if (index > comments.length) {
    commentIndex = 1;
  }
  if (index < 1) {
    commentIndex = comments.length;
  }
  //set everything to display none
  for (let i = 0; i < comments.length; i++) {
    comments[i].style.display = "none";
  }
  //set the comment at the new index to be visible
  comments[commentIndex - 1].style.display = "block";
}

let prevCommentButton = document.querySelector(".prev-comment-button");
let nextCommentButton = document.querySelector(".next-comment-button");

prevCommentButton.addEventListener("click", (e) => {
  commentIndex -= 1;
  showNewComment(commentIndex);
});

nextCommentButton.addEventListener("click", (e) => {
  commentIndex += 1;
  showNewComment(commentIndex);
});

//the following is for the invite button
inviteButton = document.querySelector(".button-invite");
//library that manages clipboard copying - doing it it with vanilla js is a bit cumbersome
new ClipboardJS(inviteButton);
inviteButton.addEventListener("click", (e) => {
  Swal.fire({
    title: "Success!",
    text: "The invite link has been copied to your clipboard. Send it to a friend so they can comment on this article!",
    icon: "success",
    confirmButtonText: "OK",
  });
});
