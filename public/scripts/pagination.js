var Comment = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <p>
          If max page is&nbsp;
          {this.props.maxP}
          &nbsp; and current page is&nbsp; 
          {this.props.currentP}
          ,&nbsp; then pagination is &nbsp;
          {this.props.children}
        </p>
      </div>
    );
  }
});


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

      $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

  },

  getInitialState: function() {
    return {data: []};
  },
  
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);

  },

  render: function() {
    return (
      <div className="commentBox">
        <h1>Pagination test</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({

  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      
      //var array = eval(comment.maxP) + eval(comment.currentP);
      
      //�z��̗v�f��F,R1,Box(5),R2,L�őS����9��
      var box = new Array(9);
      var vmaxP = parseInt(comment.maxP);
      var vcurP = parseInt(comment.currentP);
      
      const boxNum = 5;
      const range = (boxNum-1)/2;
      
      //vmaxP��5�y�[�W�܂�
      if (vmaxP <= boxNum){
      
         //F,R1�̓u�����N
         box.push("","");
         
         //box��1�`vmaxP�܂�
         for (var i = 1 ; i <= vmaxP ; i++){
            box.push(i);
         }
         
         //box�̎c���R2,L�̓u�����N
         while(box.length < 9){
            box.push("");
         }
         
      //vmaxP��5�y�[�W���傫��
      }else{
      
         //����A: vcurP - range > 1
         //����B: vcurP + range < vmaxP
         
         //A & B
         if(((vcurP - range) > 1) & (vcurP + range < vmaxP)){
         
            //F,R1
            box.push(1,"...");
            
            //box��vcurP-range����vcurP+range�܂�
            for(var i = (vcurP - range) ; i <= (vcurP + range) ; i++){
               box.push(i);
            }
            
            //R2,L
            box.push("...",vmaxP);
         
         //A! & B
         }else if(((vcurP - range) <= 1) & (vcurP + range < vmaxP)){
      
            //F,R1�̓u�����N
            box.push("","");
            
            //box��1�`boxNum�܂�
            for (var i = 1 ; i <= boxNum ; i++){
               box.push(i);
            }
         
            //R2,L
            box.push("...",vmaxP);
         
         //A & B!
         }else if(((vcurP - range) > 1) & (vcurP + range >= vmaxP)){
         
            //F,R1
            box.push(1,"...");
            
            //box��vmaxP-boxNum+1����vmaxP�܂�
            for(var i = (vmaxP - boxNum + 1) ; i <= vmaxP ; i++){
               box.push(i);
            }
            
            //R2,L�̓u�����N
            box.push("","");
         
         //A! & B!
         }else{
            //vcurP<=range+1 & vcurP>=vmaxP-range �܂�vmaxP-range<=range +1 
            //vmaxP<=2range+1 �܂� vmaxP<=boxNum
            //���̕���͕s�v
         
         }
      }
      
      //box�̉E�[�`�F�b�N
      if(box[2] == 2){
         box[2] = "";
      }
      //box�̍��[�`�F�b�N
      if(box[6] == (vmaxP - 1)){
         box[6] = "";
      }
      
      return (
        <Comment maxP={comment.maxP} currentP={comment.currentP} key={comment.id}>
          {box}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
  
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {maxP: '', currentP: ''};
  },
  handleMaxPChange: function(e) {
    this.setState({maxP: e.target.value});
  },
  handleCurrentPChange: function(e) {
    this.setState({currentP: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var maxP = this.state.maxP.trim();
    var currentP = this.state.currentP.trim();
    if (!currentP || !maxP) {
      return;
    }
    this.props.onCommentSubmit({maxP: maxP, currentP: currentP});
    this.setState({maxP: '', currentP: ''});
  },

  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="currentP"
          placeholder="Max page is..."
          value={this.state.maxP}
          onChange={this.handleMaxPChange}
        />
        <input
          type="currentP"
          placeholder="Current page is..."
          value={this.state.currentP}
          onChange={this.handleCurrentPChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }

});

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000} />,
  document.getElementById('content')
);

