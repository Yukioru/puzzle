'use client';

import { useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { AccentIconFrame } from "~/components/AccentIconFrame";
import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { useImageLoaderManager } from "~/hooks/useImageLoaderManager";

export default function DemoButtons() {
  useImageLoaderManager();
  const [isOpen, setIsOpen] = useState(false);

  const iconConfirm = (
    <AccentIconFrame>
      <FaCheck />
    </AccentIconFrame>
  );

  const iconDecline = (
    <AccentIconFrame>
      <IoClose style={{ fontSize: '1.9rem' }} />
    </AccentIconFrame>
  );

  return (
    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-start' }}>
      <ProfileSelectModal>
        <Button>Открыть модалку выбора профиля</Button>
      </ProfileSelectModal>
      <Modal
        isOpen={isOpen}
        variant="guide"
        onRequestClose={() => setIsOpen(false)}
        extra={(
          <Button onClick={() => setIsOpen(false)}>Закрыть</Button>
        )}
      >
        <Scrollbars universal autoHide autoHeight autoHeightMax={600}>
          <h2>Это контентный модал</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae eaque nihil sed voluptatem id aut laudantium ducimus maxime asperiores doloribus quidem, ab est libero minima officiis nesciunt. Voluptatum, veritatis nihil.
          Ex iusto et officia recusandae cumque sequi consectetur consequuntur necessitatibus possimus numquam temporibus alias nulla, a pariatur reiciendis eaque laboriosam facilis aspernatur error explicabo quaerat autem at dolore? Ipsa, nihil.
          Distinctio vel corporis, mollitia repellendus, atque praesentium fugiat enim quibusdam odit soluta nemo fugit molestias a? Eius, sit exercitationem tempora sapiente ullam recusandae eligendi, possimus ipsam rerum, minus sunt quae.
          A alias tempore fugiat? Quae exercitationem numquam vero nemo voluptatem sapiente inventore unde rem laboriosam voluptates, ab quasi ea corrupti mollitia! Alias vel facere magnam quae mollitia, incidunt odio repellendus?
          Atque laboriosam exercitationem inventore esse expedita ipsa, pariatur officiis itaque delectus qui et autem possimus ut voluptate nam adipisci dolorum. Est numquam corporis eum quibusdam magni modi, vitae nulla explicabo.
          Commodi ab illo enim repudiandae earum expedita cupiditate nihil sed porro praesentium libero, reprehenderit totam qui voluptas? Cumque distinctio nisi, quasi at modi culpa minima adipisci odio nostrum accusamus beatae.
          Suscipit molestiae minus beatae corporis doloribus ullam itaque id tempore velit fuga mollitia officia quas maiores sunt sapiente repellendus, quia ipsa tempora blanditiis veniam perferendis dolorum. Numquam cumque dolore fugit?
          Totam autem recusandae quibusdam fuga repudiandae harum! Debitis veritatis esse, explicabo architecto amet consequuntur quas optio sint vitae voluptatum non hic neque distinctio accusamus illum saepe asperiores? Dolorem, omnis asperiores.
          Ullam blanditiis ipsa distinctio, architecto dignissimos cumque error laborum magni. Recusandae eveniet quaerat, vitae ut rem id. Labore, neque iure. Minima porro animi magni nesciunt saepe! Unde error delectus numquam?
          Alias quidem quae quaerat cum necessitatibus, reprehenderit eum eos doloremque saepe ipsum rem voluptas iure ducimus voluptate? Blanditiis aliquid accusantium dolore autem consectetur molestias voluptatum molestiae earum laboriosam, qui odio?
          Quidem laudantium veritatis veniam ut dolore totam, sint consequuntur, repudiandae, dolores excepturi facere magnam perferendis laborum omnis aspernatur! Fuga eligendi repellat doloremque. Officiis repudiandae minima rerum nulla voluptatem quis vel?
          Cum iste quam facere consequatur, sit voluptas dolorem aspernatur nulla delectus illum totam ducimus, ut unde, laboriosam corporis tenetur? Harum, sunt tempore! Sequi, temporibus magni? Quod error praesentium tempora quis.
          Odio sunt debitis aliquam quam eveniet sed iste quo molestias quaerat alias ut, illo quos dicta cumque libero voluptates eos magni voluptate accusamus nemo repellat! Aut, sed non. Similique, possimus!
          Quasi, exercitationem fugit eius porro voluptates quis maiores quibusdam eveniet mollitia temporibus dicta veritatis cupiditate obcaecati excepturi beatae, magnam hic optio in, quos dolorem numquam illum expedita consectetur. Perferendis, velit?
          Vitae, quasi, odio quod vel voluptas doloribus natus distinctio omnis pariatur dicta repellat deleniti praesentium labore sapiente nesciunt sit et fugit perferendis assumenda consequuntur! In nihil quae excepturi esse rem?
          Ea voluptas illum totam, unde qui eos reiciendis, quibusdam voluptatem ipsa repellendus hic ipsum corporis culpa aspernatur doloremque accusantium eligendi molestiae possimus modi fuga dolorum quae labore omnis non. Eum!
          Tenetur nam repudiandae dignissimos incidunt voluptates, tempora dolorum earum. Unde maxime inventore recusandae fuga amet ad quidem similique, officiis voluptate et molestias quo magnam incidunt aut iste asperiores! Modi, facilis!
          Quasi illum autem praesentium perspiciatis sunt consequuntur iure! Perferendis minus sit totam, cupiditate expedita quod esse repellendus ducimus consectetur modi at laboriosam molestias ut aspernatur libero, alias impedit mollitia asperiores.
          Officia architecto neque culpa perspiciatis nesciunt tempore blanditiis iste quasi modi aperiam quidem, fugiat adipisci nisi laudantium commodi cum fugit, corrupti at placeat veniam! Et ad excepturi praesentium quas soluta.
          Ea nobis nostrum, nam voluptatum sequi possimus est? Assumenda molestias quas quisquam blanditiis ullam laudantium alias reprehenderit. Nihil exercitationem animi rem consequatur officia impedit nulla voluptatibus. Sequi ut beatae possimus!
          Hic, doloribus. Laborum placeat id non fugiat, aspernatur sit veniam libero, nulla nobis minus pariatur soluta. Vel itaque inventore repudiandae, obcaecati aliquam sequi assumenda officiis magni asperiores molestias sint fuga?
          Rem numquam culpa earum reiciendis quo sed asperiores saepe, quas placeat dolor vitae quisquam sit, voluptatum tempora eligendi incidunt doloribus, aliquid delectus. Maxime, dolorem. Amet debitis quidem nisi odit asperiores?
          Eos, nesciunt! Veritatis aliquam, tempore omnis excepturi, porro impedit inventore at distinctio reiciendis quaerat delectus pariatur quisquam! Fugiat, voluptate provident placeat repudiandae illum incidunt iure neque, blanditiis nam hic vel!
          Fuga magni quasi exercitationem atque rem, excepturi at quam sapiente quae magnam ut tenetur alias error dolore, culpa delectus, aliquid quos voluptates. Quo doloremque commodi animi debitis atque sunt rerum?
          Neque inventore suscipit cumque vitae placeat quasi mollitia consequatur laudantium, et aliquid tenetur eius perspiciatis facilis omnis necessitatibus sapiente ipsum saepe nesciunt ea? Debitis distinctio, ut ex modi maxime facilis?
          Necessitatibus vero doloribus animi nemo nihil quidem quod mollitia beatae neque facere reiciendis, cumque autem deleniti sint tenetur vel quaerat laboriosam, aliquam aliquid! Iure eaque repellendus qui eligendi ea officia!
          Nam asperiores saepe cum, corporis ut earum quam enim vel! Quaerat, eos eligendi obcaecati corrupti voluptates aperiam dolores itaque veritatis voluptatibus porro aspernatur tempora inventore! Sint beatae porro reiciendis velit!
          Fugiat, eligendi magnam? Maiores cumque necessitatibus amet eos? Unde laborum corrupti dicta necessitatibus esse. Animi distinctio sequi, odio at consequuntur aspernatur itaque ipsam illum est sed accusamus eligendi nemo laudantium.
          Delectus atque doloremque accusantium iure ex, nesciunt, in voluptate quisquam, reprehenderit illo libero eos ducimus minima consequatur perspiciatis deserunt quas. Impedit illo accusamus saepe voluptas distinctio incidunt itaque exercitationem eaque.
          Dolor odit quasi deserunt nostrum voluptates beatae ipsam optio quod. Error, facilis? Optio harum iure animi dolor. Deserunt hic voluptatibus repellat, aliquid culpa deleniti enim voluptatem dolore iste, voluptate facere.
          Dolorum libero eligendi facilis numquam recusandae officiis quisquam quae cumque magnam porro, excepturi dolore quam eveniet asperiores praesentium ducimus veritatis vel odit? Impedit rem ipsum explicabo amet ex reprehenderit optio.
          Dolores, fugiat aperiam nemo doloribus excepturi temporibus dolor sequi vel sint hic, quibusdam harum. Delectus, quis voluptatibus, aut fuga ad culpa eaque aliquam, corrupti non maiores unde dicta ipsam. Minus.
          Quasi dolorem id amet animi voluptatibus, impedit esse voluptas est temporibus corrupti numquam illum et molestiae ea ullam culpa, rerum deleniti labore. Corporis laudantium obcaecati odio sunt, error veritatis harum.
          Beatae iusto sapiente dolorem animi perferendis. Nam recusandae voluptate hic dolorem facere veniam obcaecati aut ipsam, porro mollitia quos sed minima saepe temporibus cumque natus accusantium reprehenderit iure fugit error!
          Dolor, hic? Molestiae laboriosam doloremque quis a assumenda aliquam aut quibusdam numquam at adipisci quas facere magni impedit, ipsa repellendus perferendis non vitae. Error quis doloribus accusamus quia, assumenda qui?
          Atque earum possimus, amet numquam aut pariatur eum tenetur nam iure, debitis similique impedit non accusantium sint, rem repellat corporis praesentium. Quidem reiciendis facilis obcaecati facere rem, quo iste est!
          Esse repellat quam atque tenetur consequatur illum officiis fugit reiciendis saepe totam neque ullam provident harum velit quidem corporis maiores numquam aliquam fuga, iusto debitis asperiores dolor? Ex, fugiat delectus.
          Praesentium nam, ipsa fuga esse in porro quidem suscipit nulla aliquam itaque velit saepe quo. Nihil expedita repellat sit! Facilis numquam suscipit possimus earum eum temporibus minus molestiae doloribus ut.
          Porro adipisci natus ducimus iure dolor, laborum mollitia ipsa enim reprehenderit soluta dicta at totam fugiat consequatur obcaecati amet! Eaque enim vero, optio tempore aliquam unde harum corrupti doloribus iure!
          Tenetur odit sunt nisi, mollitia aliquid fuga numquam dolorum magnam autem, eligendi commodi sit omnis rem eaque deserunt. Distinctio reiciendis commodi optio officia blanditiis, maiores ipsam labore quia perspiciatis exercitationem.
          Iste praesentium inventore adipisci itaque minus, minima officia nulla eveniet sit error assumenda, fugit voluptate illum eligendi! Cum suscipit sed placeat eligendi officiis rem dolorum aliquam, delectus consequatur dignissimos at?
          Temporibus sapiente quia illo repellendus! Sapiente alias tempore culpa, aliquam beatae commodi atque doloremque quidem corrupti voluptatibus, eos quam, labore tempora. Atque est cumque, omnis sit iure sint tenetur debitis!
          Ut cupiditate quod exercitationem harum sunt, incidunt, illum architecto animi, sed illo error repellat maxime nesciunt. Esse consectetur, aperiam aut culpa, doloremque a modi saepe aliquid quam quidem laboriosam nulla?
          Esse ipsam neque ad officiis eaque cupiditate porro facere optio illum, voluptas hic omnis libero molestiae explicabo aspernatur. Aliquid inventore blanditiis perspiciatis iste numquam iure ipsum eveniet porro voluptate quibusdam!
          Deserunt deleniti aliquam temporibus praesentium rerum quidem, aut incidunt ad placeat atque iure aperiam harum doloremque est a architecto alias corporis blanditiis enim libero exercitationem culpa eum illum. Dolores, ratione.
          Aliquid voluptatem repellat esse consequuntur, nam, dolores distinctio saepe minima quis omnis amet eum corrupti odio quos fugiat facilis, quod ratione quo sequi quibusdam. Eligendi excepturi inventore nemo magnam reprehenderit.
          Nihil alias laboriosam voluptates maiores animi iusto error esse deleniti praesentium aspernatur ipsam cumque cum cupiditate, rerum exercitationem deserunt soluta voluptatibus corporis facere nobis ducimus recusandae. Impedit dolorem enim maxime.
          Pariatur excepturi, tempora, ducimus aspernatur dolorum placeat voluptatibus, iusto esse voluptate omnis nesciunt tenetur nobis ipsum. Hic dicta consequatur obcaecati beatae vitae ut? Ipsa eius officiis id? Ab, est libero.
          Enim voluptatibus voluptatum veniam nostrum perspiciatis ratione delectus eligendi tenetur magnam eveniet? Dolor, minima vitae enim dolores excepturi ut voluptates accusamus vel nostrum, nemo blanditiis doloremque iusto! Voluptatem, quas suscipit?
          Explicabo veniam maxime corrupti porro quae, fugit itaque suscipit, molestiae sint dicta numquam illum voluptate sed ullam consectetur aspernatur dolorem rerum commodi animi aut officiis eveniet doloremque expedita! Sapiente, dolorum.</p>
        </Scrollbars>
      </Modal>
      <Button onClick={() => setIsOpen(true)}>Открыть контентный модал</Button>
      <hr style={{ width: '100%' }} />
      <Button icon={iconConfirm}>Подтвердить</Button>
      <Button icon={iconConfirm} disabled>Подтвердить</Button>
      <Button icon={iconDecline}>Отменить</Button>
      <Button icon={iconDecline} disabled>Отменить</Button>
    </div>
  )
}