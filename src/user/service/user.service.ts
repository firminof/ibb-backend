import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {UserRepository} from "../repository/user.repository";
import {UserEntity} from "../domain/entity/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateUserValidation} from "./create-user-validation";
import {UpdateUserDto} from "../dto/update-user.dto";
import {DeleteUserDto} from "../dto/delete-user.dto";
import {IUserResponseApi} from "../dto/list-users.dto";
import {formatListMember} from "../../common/helpers/helpers";
import {EmailService} from "./email.service";
import {SendEmailDto} from "../dto/send-email.dto";
import {CreateUserInviteDto} from "../dto/create-user-invite.dto";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private createUserValidation: CreateUserValidation,
        private emailService: EmailService
    ) {
    }

    async getAll(): Promise<IUserResponseApi[]> {
        Logger.log(`> [Service][User][GET][getAll] - init`);
        try {
            const allMembers: UserEntity[] = await this.userRepository.getAll();

            return formatListMember(allMembers);
        } catch (e) {
            Logger.log(`> [Service][User][GET][getAll] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async getAllBirthdaysMonth(month: number): Promise<IUserResponseApi[]> {
        Logger.log(`> [Service][User][GET][getAllBirthdaysMonth] - init`);
        try {
            const allMembers: UserEntity[] = await this.userRepository.getAll();

            const allBirthdaysMonth: UserEntity[] = [];

            allMembers.forEach((member: UserEntity) => {
                const dataNasc: Date = new Date(`${member.data_nascimento.toString().split('T')[0]}T03:01:00.000Z`);

                if ((dataNasc.getMonth() + 1) === Number(month)) {
                    allBirthdaysMonth.push(member);
                }
            })

            return formatListMember(allBirthdaysMonth);
        } catch (e) {
            Logger.log(`> [Service][User][GET][getAllBirthdaysMonth] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async create(data: CreateUserDto) {
        Logger.log(`> [Service][User][POST][Create] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][Post][POST] user - ${JSON.stringify(user)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            const validatedInput: CreateUserDto = this.createUserValidation.validate(data);

            const newUser: UserEntity = {
                conjugue: validatedInput.conjugue,
                cpf: validatedInput.cpf,
                data_casamento: validatedInput.data_casamento,
                data_nascimento: validatedInput.data_nascimento,
                diacono: validatedInput.diacono,
                email: validatedInput.email,
                endereco: validatedInput.endereco,
                estado_civil: validatedInput.estado_civil,
                filhos: validatedInput.filhos,
                foto: validatedInput.foto,
                ministerio: validatedInput.ministerio,
                nome: validatedInput.nome,
                possui_filhos: validatedInput.possui_filhos,
                rg: validatedInput.rg,
                role: validatedInput.role,
                status: validatedInput.status,
                telefone: validatedInput.telefone,
                transferencia: validatedInput.transferencia,
                createdAt: new Date(),
                updatedAt: new Date(),
                data_ingresso: validatedInput.data_ingresso,
                excluido: validatedInput.excluido,
                falecimento: validatedInput.falecimento,
                forma_ingresso: validatedInput.forma_ingresso,
                local_ingresso: validatedInput.local_ingresso,
                motivo_exclusao: validatedInput.motivo_exclusao,
                motivo_falecimento: validatedInput.motivo_falecimento,
                motivo_transferencia: validatedInput.motivo_transferencia,
                motivo_visita: validatedInput.motivo_visita
            }

            const saved = await this.userRepository.save(newUser);
            Logger.log(`> [Service][User][POST][Create] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][POST][Create] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][POST][Create] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async acceptInvite(data: CreateUserInviteDto) {
        Logger.log(`> [Service][User][POST][acceptInvite] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][Post][acceptInvite] user - ${JSON.stringify(user)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            const validatedInput: CreateUserInviteDto = this.createUserValidation.validateInvite(data);

            const newUser: UserEntity = {
                conjugue: validatedInput.conjugue,
                cpf: validatedInput.cpf,
                data_casamento: validatedInput.data_casamento,
                data_nascimento: validatedInput.data_nascimento,
                diacono: {
                    id: 0,
                    nome: '',
                },
                email: validatedInput.email,
                endereco: validatedInput.endereco,
                estado_civil: validatedInput.estado_civil,
                filhos: validatedInput.filhos,
                foto: validatedInput.foto,
                ministerio: validatedInput.ministerio,
                nome: validatedInput.nome,
                possui_filhos: validatedInput.possui_filhos,
                rg: validatedInput.rg,
                role: validatedInput.role,
                status: validatedInput.status,
                telefone: validatedInput.telefone,
                transferencia: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                data_ingresso: null,
                excluido: null,
                falecimento: null,
                forma_ingresso: null,
                local_ingresso: null,
                motivo_exclusao: null,
                motivo_falecimento: null,
                motivo_transferencia: null,
                motivo_visita: null

            }

            const saved = await this.userRepository.save(newUser);
            Logger.log(`> [Service][User][POST][acceptInvite] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][POST][acceptInvite] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][POST][acceptInvite] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async update(id: string, data: UpdateUserDto) {
        Logger.log(`> [Service][User][PUT][update] init`);
        try {
            const user: UserEntity = await this.userRepository.findById(id);
            Logger.log(`> [Service][User][PUT][update][findById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const saved = await this.userRepository.save({
                ...user,
                ...data
            })
            Logger.log(`> [Service][User][PUT][update] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][PUT][update] finished`);
        } catch (e) {
            Logger.log(`> [Service][User][PUT][update] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async delete(param: DeleteUserDto) {
        Logger.log(`> [Service][User][DELETE] init`);
        try {
            const user: UserEntity = await this.userRepository.findById(param.id);
            Logger.log(`> [Service][User][PUT][update][findById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            await this.userRepository.deleteUser(user);
        } catch (e) {
            Logger.log(`> [Service][User][DELETE] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async sendInvite(data: SendEmailDto) {
        Logger.log(`> [Service][User][POST][sendInvite] - init`);

        if (!data) {
            throw new NotFoundException('Configuração do email não informada!');
        }

        if (data.to.length === 0) {
            throw new NotFoundException('Destinatário não informado!');
        }

        if (data.subject.length === 0) {
            throw new NotFoundException('Assunto não informado!');
        }

        if (data.text.length === 0) {
            throw new NotFoundException('Texto não informado!');
        }

        data.html = `
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
          color: #ffffff !important;
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
    <h1>${data.requestName && data.requestName.length > 0 ? this.createUserValidation.capitalizeFirstLetter(data.requestName) + ' convidou você!' : 'Você foi convidado!'}</h1>
    <p>Estamos felizes em convidá-lo(a) para se juntar à <b>Igreja Batista do Brooklin (IBB)</b>.</p>

    <p>Clique no link abaixo para aceitar o convite e completar seu cadastro.</p>
    <a href="http://localhost:3000/invite?email=${data.to}" class="button">Aceitar Convite e atualizar dados</a>
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
`;
        // {
        //     "to": "filipefirminof@hotmail.com",
        //     "subject": "Convite IBB",
        //     "text": "Convite IBB"
        // }
        try {
            const sendEmailBySendGrid = await this.emailService.sendEmail(data.to, data.subject, data.text, data.html);

            if (sendEmailBySendGrid.success) {
                return 'Email enviado com sucesso!'
            } else {
                return 'Falha ao enviar o email!'
            }
        } catch (e) {
            Logger.log(`> [Service][User][POST][sendInvite] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async findByEmail(email: string) {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }
}


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://filipefirmino:P22J9JoyBsyMrc6M@ibbclustermongodb.meo2m.mongodb.net/?retryWrites=true&w=majority&appName=IbbClusterMongoDb";
//
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });
//
// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);
