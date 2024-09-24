export const SendInviteEmailBody =
`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para Igreja Batista do Brooklin (IBB)</title>
  <style>
      body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }

      .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .header {
          text-align: center;
          background-color: #333333;
          color: #ffffff;
          padding: 20px;
          border-radius: 8px 8px 0 0;
      }

      .content {
          margin: 20px 0;
          text-align: center;
      }

      .content h1 {
          color: #333333;
      }

      .content p {
          font-size: 16px;
          color: #666666;
      }

      .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
          font-size: 16px;
          font-weight: 700;
      }

      .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #999999;
      }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Seja membro da Igreja Batista do Brooklin (IBB)</h1>
  </div>
  <div class="content">
    <h1>Você foi convidado!</h1>
    <p>Estamos felizes em convidá-lo(a) para se juntar à <b>Igreja Batista do Brooklin (IBB)</b>.</p>

    <p>Clique no link abaixo para aceitar o convite e completar seu cadastro.</p>
    <a href="http://localhost:3000/invite" class="button">Aceitar Convite e atualizar dados</a>
    <br/>
    <br/>
  </div>
  <div class="footer">
    <p>Se você não solicitou este convite, pode ignorar este email.</p>
    <p>&copy; 2024 Igreja Batista do Brooklin (IBB). Todos os direitos reservados.</p>
  </div>
</div>
</body>
</html>
`
